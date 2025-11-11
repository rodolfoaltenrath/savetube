import os
import time
import json
import uuid
import glob
import tempfile
import logging
from typing import Dict, Any, Generator, Optional

import certifi
os.environ.setdefault('SSL_CERT_FILE', certifi.where())
os.environ.setdefault('REQUESTS_CA_BUNDLE', certifi.where())

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
FFMPEG_PATH = os.path.join(BASE_DIR, 'bin', 'ffmpeg')
os.environ["FFMPEG_LOCATION"] = FFMPEG_PATH

import yt_dlp
from flask import (
    Flask, Response, render_template,
    request, send_file, make_response, jsonify
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

TEMPLATE_DIR = os.path.join(BASE_DIR, 'templates')
STATIC_DIR = os.path.join(BASE_DIR, 'static')
app = Flask(__name__, template_folder=TEMPLATE_DIR, static_folder=STATIC_DIR)

DOWNLOAD_STATE: Dict[str, Any] = {"progress": 0, "status": "idle"}

def progress_hook(d: Dict[str, Any]) -> None:
    """Callback do yt-dlp para atualizar o estado global do download."""
    global DOWNLOAD_STATE
    status = d.get('status')

    if status == 'downloading':
        progress_str = d.get('_percent_str', '0%').strip()
        progress_str = progress_str.replace('\x1b[0;94m', '').replace('\x1b[0m', '')
        try:
            progress = float(progress_str.replace('%', ''))
            DOWNLOAD_STATE["progress"] = max(0.0, min(100.0, progress))
            DOWNLOAD_STATE["status"] = "downloading"
        except (ValueError, TypeError):
            pass
    elif status == 'finished':
        DOWNLOAD_STATE["progress"] = 100.0
        DOWNLOAD_STATE["status"] = "finished"

def _sanitize_filename(name: str) -> str:
    """Remove caracteres problemáticos para nomes de arquivos."""
    return "".join(c for c in name if c.isalnum() or c in (' ', '-', '_')).rstrip()

def _find_newest_with_ext(directory: str, ext: str) -> Optional[str]:
    """Retorna o arquivo mais recente no diretório com a extensão indicada."""
    pattern = os.path.join(directory, f'*.{ext.lstrip(".")}')
    candidates = glob.glob(pattern)
    if not candidates:
        return None
    candidates.sort(key=lambda p: os.path.getmtime(p), reverse=True)
    return candidates[0]

def download_media(
    url: str,
    file_type: str,
    audio_bitrate: Optional[str] = None,
    video_quality: Optional[str] = None
) -> str:
    """
    Realiza o download de mídia (MP3 ou MP4) via yt-dlp e retorna o caminho final.
    - MP3: usa FFmpegExtractAudio (precisa FFmpeg instalado). Aceita 'audio_bitrate' (kbps).
    - MP4: mescla melhor vídeo + melhor áudio. Aceita 'video_quality' (altura máxima, ex.: 720).
    """
    global DOWNLOAD_STATE
    DOWNLOAD_STATE = {"progress": 0.0, "status": "starting"}

    temp_dir = tempfile.mkdtemp(prefix="savetube_", dir="/tmp")
    outtmpl = os.path.join(temp_dir, '%(title).200B.%(ext)s')

    ydl_opts: Dict[str, Any] = {
        'outtmpl': outtmpl,
        'progress_hooks': [progress_hook],
        'noplaylist': True,
        'logger': logging.getLogger(__name__),
        'nocheckcertificate': True,
        'overwrites': True,
        'quiet': False,
        'ffmpeg_location': FFMPEG_PATH,
    }

    if file_type == 'mp3':
        try:
            target_kbps = str(int(audio_bitrate)) if audio_bitrate else '192'
        except Exception:
            target_kbps = '192'

        ydl_opts.update({
            'format': 'bestaudio/best',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': target_kbps,
            }],
            'prefer_ffmpeg': True,
        })
    else:
        fmt: str
        try:
            h = int(video_quality) if video_quality else None
        except Exception:
            h = None

        if h:
            fmt = f"bestvideo[ext=mp4][height<={h}]+bestaudio[ext=m4a]/best[height<={h}]"
        else:
            fmt = "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best"

        ydl_opts.update({
            'format': fmt,
            'merge_output_format': 'mp4',
        })

    try:
        logging.info(f"Iniciando download: url={url} tipo={file_type} dir={temp_dir} opts_extra={{'audio_bitrate': %s, 'video_quality': %s}}",
                     audio_bitrate, video_quality)
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            if not info:
                raise ValueError("Não foi possível extrair informações da URL.")

            title = info.get('title') or f'media_{uuid.uuid4().hex[:8]}'
            sanitized_title = _sanitize_filename(title)

            final_path: Optional[str] = None

            if file_type == 'mp3':
                final_path = _find_newest_with_ext(temp_dir, 'mp3')
                if not final_path:
                    final_path = _find_newest_with_ext(temp_dir, 'webm') or _find_newest_with_ext(temp_dir, 'm4a')
                    if not final_path:
                        raise ValueError("Falha ao localizar o arquivo MP3 gerado. Verifique se o FFmpeg está instalado no PATH.")
                dest = os.path.join(temp_dir, f"{sanitized_title}.mp3")
                if os.path.abspath(final_path) != os.path.abspath(dest):
                    os.replace(final_path, dest)
                final_path = dest

            else:
                final_path = _find_newest_with_ext(temp_dir, 'mp4')
                if not final_path:
                    guessed = ydl.prepare_filename(info)
                    if guessed and os.path.exists(guessed):
                        final_path = guessed
                    else:
                        final_path = _find_newest_with_ext(temp_dir, 'mkv') or _find_newest_with_ext(temp_dir, 'webm')
                if not final_path:
                    raise ValueError("Falha ao localizar o arquivo de vídeo final (merge). Verifique FFmpeg.")

                _, ext = os.path.splitext(final_path)
                dest = os.path.join(temp_dir, f"{sanitiz_title}{ext}")
                if os.path.abspath(final_path) != os.path.abspath(dest):
                    os.replace(final_path, dest)
                final_path = dest

            logging.info(f"Download concluído: {final_path}")
            DOWNLOAD_STATE["status"] = "finished"
            DOWNLOAD_STATE["progress"] = 100.0
            return final_path

    except yt_dlp.utils.DownloadError as e:
        logging.error(f"Erro yt-dlp: {e}")
        DOWNLOAD_STATE["status"] = "error"
        raise
    except Exception as e:
        logging.exception("Erro inesperado em download_media")
        DOWNLOAD_STATE["status"] = "error"
        raise ValueError(f"Ocorreu um erro inesperado: {e}")

@app.route('/', methods=['GET', 'POST'])
def index():
    """
    GET: Renderiza o template 'index.html' (que monta o Vue).
    POST: Recebe URL + tipo (mp3/mp4) + opções e retorna o arquivo.
    """
    if request.method == 'POST':
        url = (request.form.get('url') or '').strip()
        file_type = (request.form.get('file_type') or 'mp4').strip().lower()

        audio_bitrate = request.form.get('audio_bitrate')
        video_quality = request.form.get('video_quality')

        if not url:
            return render_template('index.html', message="Erro: A URL não pode estar vazia."), 400

        try:
            file_path = download_media(
                url,
                file_type,
                audio_bitrate=audio_bitrate,
                video_quality=video_quality
            )
            file_name = os.path.basename(file_path)

            response = send_file(file_path, as_attachment=True, download_name=file_name)

            def _cleanup():
                try:
                    directory = os.path.dirname(file_path)
                    if os.path.exists(file_path):
                        os.remove(file_path)
                    try:
                        for leftover in os.listdir(directory):
                            try:
                                os.remove(os.path.join(directory, leftover))
                            except Exception:
                                pass
                        os.rmdir(directory)
                    except Exception:
                        pass
                    logging.info(f"Limpeza concluída: {directory}")
                except Exception as e:
                    logging.error(f"Erro ao limpar temporários: {e}")

            response.call_on_close(_cleanup)
            return response

        except Exception as e:
            logging.exception("Falha no processamento do POST /")
            return render_template('index.html', message=f"Erro ao processar sua solicitação: {e}"), 500

    return render_template('index.html', message='')

@app.route('/download-progress')
def download_progress_route() -> Response:
    """SSE: envia JSON com {'progress': <0..100>} e, em caso de erro, {'progress': -1, 'error': '...'}"""

    def generate() -> Generator[str, None, None]:
        global DOWNLOAD_STATE
        last_progress = None

        while DOWNLOAD_STATE.get("status") in ("starting", "downloading"):
            prog = DOWNLOAD_STATE.get("progress", 0.0)
            if prog != last_progress:
                data = json.dumps({'progress': prog})
                yield f"data: {data}\n\n"
                last_progress = prog
            time.sleep(0.4)

        final_status = DOWNLOAD_STATE.get("status", "finished")
        if final_status == "error":
            data = json.dumps({'progress': -1, 'error': 'Falha no download.'})
        else:
            data = json.dumps({'progress': 100})
        yield f"data: {data}\n\n"

    headers = {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no"
    }
    return Response(generate(), headers=headers)

@app.route('/metadata', methods=['GET', 'POST'])
def metadata_route():
    """Retorna metadados básicos do vídeo sem baixar: title, thumbnail, duration."""
    try:
        if request.method == 'POST':
            data = request.get_json(silent=True) or {}
            url = (data.get('url') or '').strip()
        else:
            url = (request.args.get('url') or '').strip()

        if not url:
            return jsonify({ 'error': 'missing url' }), 400

        ydl_opts: Dict[str, Any] = {
            'quiet': True,
            'noplaylist': True,
            'nocheckcertificate': True,
            'skip_download': True,
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
        if not info:
            return jsonify({ 'error': 'no info' }), 404

        return jsonify({
            'title': info.get('title') or '',
            'thumbnail': info.get('thumbnail') or '',
            'duration': info.get('duration') or 0,
        })
    except Exception as e:
        logging.exception('Erro ao extrair metadados')
        return jsonify({ 'error': str(e) }), 500

@app.route('/como_usar')
def como_usar():
    """Corrigido: o template chama-se 'comousar.html'."""
    return render_template('comousar.html')

@app.route('/contato')
def contato():
    return render_template('contato.html')

@app.route('/termos-e-condicoes')
def termosecondicoes():
    return render_template('termos-e-condicoes.html')

@app.errorhandler(500)
def internal_error(e):
    logging.exception("Erro 500 não tratado")
    resp = make_response(render_template('index.html', message="Erro interno do servidor."), 500)
    return resp

if __name__ == '__main__':
    if os.name == 'nt':
         local_ffmpeg_dir = r"C:\ffmpeg\bin"
         os.environ["PATH"] = local_ffmpeg_dir + os.pathsep + os.environ.get("PATH", "")
         os.environ["FFMPEG_LOCATION"] = local_ffmpeg_dir
         FFMPEG_PATH = local_ffmpeg_dir
    
    app.run(host="0.0.0.0", port=8080, debug=True)
