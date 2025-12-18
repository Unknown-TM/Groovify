import os
import json
import threading
from flask import Flask, request, jsonify, Response, render_template
import yt_dlp
import requests

app = Flask(__name__, template_folder="templates", static_folder="static")
DATA_DIR = "data"
os.makedirs(DATA_DIR, exist_ok=True)

# Paths for local storage
SEARCH_CACHE_PATH = os.path.join(DATA_DIR, "search_cache.json")
FAVORITES_PATH = os.path.join(DATA_DIR, "favorites.json")
PLAYLISTS_PATH = os.path.join(DATA_DIR, "playlists.json")
METADATA_CACHE_PATH = os.path.join(DATA_DIR, "metadata_cache.json")

lock = threading.Lock()

def load_json(path, default):
    if not os.path.exists(path):
        return default
    with open(path, "r", encoding="utf-8") as f:
        try:
            return json.load(f)
        except:
            return default

def save_json(path, data):
    with lock:
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

# Initialize files
for p, d in [(SEARCH_CACHE_PATH, {}), (FAVORITES_PATH, []), (PLAYLISTS_PATH, {}), (METADATA_CACHE_PATH, {})]:
    if not os.path.exists(p):
        save_json(p, d)

############################
# yt-dlp helpers
############################
YDL_COMMON_OPTS = {
    "quiet": True,
    "nocheckcertificate": True,
    "skip_download": True,
    "cookiefile": "cookies.txt",
    "extractor_retries": 3,
    "format": "bestaudio[ext=m4a]/bestaudio/best",
    "no_check_certificate": True,
    "ignoreerrors": False,
    "logtostderr": False,
    "extract_flat": False,
    "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "*/*",
        "Accept-Language": "en-US,en;q=0.9",
        "Sec-Fetch-Mode": "navigate",
    }
}

def search_source(query, source="youtube", max_results=10):  # 🔥 unified search
    ydl_opts = dict(YDL_COMMON_OPTS)
    ydl_opts["format"] = "bestaudio/best"
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            if source == "soundcloud":
                search_spec = f"scsearch{max_results}:{query}"
            else:
                search_spec = f"ytsearch{max_results}:{query}"
            info = ydl.extract_info(search_spec, download=False)
            entries = info.get("entries", []) if info else []
            results = []
            for e in entries:
                results.append({
                    "id": e.get("id"),
                    "title": e.get("title"),
                    "duration": e.get("duration"),
                    "thumbnail": e.get("thumbnail"),
                    "uploader": e.get("uploader"),
                    "webpage_url": e.get("webpage_url"),
                    "source": source,  # 🔥 tag with source
                })
            return results
    except Exception as e:
        print(f"Search error for {source}: {e}")
        # Try without cookies as fallback
        if source == "youtube":
            try:
                fallback_opts = dict(YDL_COMMON_OPTS)
                del fallback_opts["cookiefile"]  # Remove cookies
                with yt_dlp.YoutubeDL(fallback_opts) as ydl:
                    search_spec = f"ytsearch{max_results}:{query}"
                    info = ydl.extract_info(search_spec, download=False)
                    entries = info.get("entries", []) if info else []
                    results = []
                    for e in entries:
                        results.append({
                            "id": e.get("id"),
                            "title": e.get("title"),
                            "duration": e.get("duration"),
                            "thumbnail": e.get("thumbnail"),
                            "uploader": e.get("uploader"),
                            "webpage_url": e.get("webpage_url"),
                            "source": source,
                        })
                    return results
            except Exception as fallback_error:
                print(f"Fallback search also failed: {fallback_error}")
        return []

def extract_audio_info(item_id, source="youtube"):  # 🔥 support SC + YT
    ydl_opts = dict(YDL_COMMON_OPTS)
    ydl_opts["format"] = "bestaudio/best"
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            if source == "soundcloud":
                # SC uses full URL instead of bare ID
                if not item_id.startswith("http"):
                    spec = f"https://soundcloud.com/{item_id}"
                else:
                    spec = item_id
            else:  # youtube
                if item_id.startswith("http"):
                    spec = item_id
                else:
                    spec = f"https://www.youtube.com/watch?v={item_id}"

            info = ydl.extract_info(spec, download=False)
            if not info:
                return None

            audio_url = info.get("url")
            if not audio_url:
                fmts = info.get("formats", []) or []
                audio_formats = [
                    f for f in fmts if f.get("acodec") and f.get("acodec") != "none"
                    and (f.get("vcodec") in (None, "none"))
                ]
                audio_formats.sort(key=lambda f: (f.get("abr") or f.get("tbr") or 0), reverse=True)
                audio_url = audio_formats[0].get("url") if audio_formats else None

            metadata = {
                "id": info.get("id"),
                "title": info.get("title"),
                "duration": info.get("duration"),
                "thumbnail": info.get("thumbnail"),
                "uploader": info.get("uploader"),
                "webpage_url": info.get("webpage_url"),
                "source": source,
            }
            # cache
            meta_cache = load_json(METADATA_CACHE_PATH, {})
            meta_cache[f"{source}:{metadata['id']}"] = metadata
            save_json(METADATA_CACHE_PATH, meta_cache)
            return {"audio_url": audio_url, "metadata": metadata}
    except Exception as e:
        print(f"Extract audio error for {source} {item_id}: {e}")
        # Try without cookies as fallback
        if source == "youtube":
            try:
                fallback_opts = dict(YDL_COMMON_OPTS)
                del fallback_opts["cookiefile"]  # Remove cookies
                with yt_dlp.YoutubeDL(fallback_opts) as ydl:
                    if item_id.startswith("http"):
                        spec = item_id
                    else:
                        spec = f"https://www.youtube.com/watch?v={item_id}"
                    
                    info = ydl.extract_info(spec, download=False)
                    if not info:
                        return None

                    audio_url = info.get("url")
                    if not audio_url:
                        fmts = info.get("formats", []) or []
                        audio_formats = [
                            f for f in fmts if f.get("acodec") and f.get("acodec") != "none"
                            and (f.get("vcodec") in (None, "none"))
                        ]
                        audio_formats.sort(key=lambda f: (f.get("abr") or f.get("tbr") or 0), reverse=True)
                        audio_url = audio_formats[0].get("url") if audio_formats else None

                    metadata = {
                        "id": info.get("id"),
                        "title": info.get("title"),
                        "duration": info.get("duration"),
                        "thumbnail": info.get("thumbnail"),
                        "uploader": info.get("uploader"),
                        "webpage_url": info.get("webpage_url"),
                        "source": source,
                    }
                    # cache
                    meta_cache = load_json(METADATA_CACHE_PATH, {})
                    meta_cache[f"{source}:{metadata['id']}"] = metadata
                    save_json(METADATA_CACHE_PATH, meta_cache)
                    return {"audio_url": audio_url, "metadata": metadata}
            except Exception as fallback_error:
                print(f"Fallback extract also failed: {fallback_error}")
        return None

############################
# Routes
############################
@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/search", methods=["POST"])
def api_search():
    payload = request.get_json() or {}
    query = payload.get("query", "").strip()
    source = payload.get("source", "youtube").lower()  # 🔥 pick source
    if not query:
        return jsonify({"error": "empty query"}), 400

    search_cache = load_json(SEARCH_CACHE_PATH, {})
    key = f"{source}:{query.lower()}"
    if key in search_cache:
        return jsonify({"results": search_cache[key], "cached": True})

    results = search_source(query, source, max_results=10)
    search_cache[key] = results
    save_json(SEARCH_CACHE_PATH, search_cache)
    return jsonify({"results": results, "cached": False})

@app.route("/api/info", methods=["POST"])
def api_info():
    payload = request.get_json() or {}
    vid = payload.get("id") or ""
    source = payload.get("source", "youtube")
    if not vid:
        return jsonify({"error": "missing id"}), 400
    info = extract_audio_info(vid, source=source)
    if not info:
        return jsonify({"error": "couldn't extract"}), 500
    return jsonify({"metadata": info["metadata"]})

@app.route("/api/stream", methods=["POST"])
def api_stream():
    payload = request.get_json() or {}
    # Front-end might send 'url' or 'id'
    vid = payload.get("id")
    if not vid:
        # Extract ID from URL if provided
        url = payload.get("url", "")
        if "youtube.com" in url or "youtu.be" in url:
            if "v=" in url:
                vid = url.split("v=")[1].split("&")[0]
            else:
                vid = url.split("/")[-1].split("?")[0]
        else:
            vid = url # fallback for SC or raw IDs
            
    source = payload.get("source", "youtube")
    if not vid:
        return jsonify({"error": "missing id or url"}), 400
        
    # Instead of extracting the raw stream URL here (which expires),
    # we return the URL to our own proxy endpoint.
    stream_url = f"/stream/{source}/{vid}"
    return jsonify({"stream_url": stream_url})

@app.route("/stream/<source>/<item_id>")
def stream_proxy(source, item_id):
    info = extract_audio_info(item_id, source=source)
    if not info or not info.get("audio_url"):
        return ("Not found or cannot extract audio", 404)
    
    audio_url = info["audio_url"]
    
    # Support for Range headers (critical for seeking and browser compatibility)
    request_headers = {}
    if 'Range' in request.headers:
        request_headers['Range'] = request.headers['Range']
    request_headers["User-Agent"] = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

    try:
        # We use a longer timeout and stream=True to proxy the audio chunks
        upstream = requests.get(audio_url, stream=True, headers=request_headers, timeout=15)
        
        # Build passthrough headers
        response_headers = {}
        for h in ['Content-Type', 'Content-Length', 'Accept-Ranges', 'Content-Range']:
            if h in upstream.headers:
                response_headers[h] = upstream.headers[h]
        
        # Ensure a content type exists
        if 'Content-Type' not in response_headers:
            response_headers['Content-Type'] = 'audio/mpeg' if source == 'youtube' else 'audio/mpeg'

        def generate():
            try:
                for chunk in upstream.iter_content(chunk_size=16384):
                    if chunk:
                        yield chunk
            finally:
                upstream.close()
        
        return Response(
            generate(),
            status=upstream.status_code,
            headers=response_headers
        )
    except Exception as e:
        print(f"Streaming error for {item_id}: {e}")
        return str(e), 500

############################
# Favorites & Playlists
############################
@app.route("/api/favorites", methods=["GET", "POST", "DELETE"])
def api_favorites():
    favorites = load_json(FAVORITES_PATH, [])
    if request.method == "GET":
        return jsonify({"favorites": favorites})

    data = request.get_json() or {}
    vid = data.get("id")
    source = data.get("source", "youtube")
    if not vid:
        return jsonify({"error": "missing id"}), 400

    if request.method == "POST":
        meta_cache = load_json(METADATA_CACHE_PATH, {})
        meta = meta_cache.get(f"{source}:{vid}")
        if not meta:
            info = extract_audio_info(vid, source=source)
            meta = info["metadata"] if info else {"id": vid, "title": vid, "source": source}
        if not any(f.get("id") == vid and f.get("source") == source for f in favorites):
            favorites.append(meta)
            save_json(FAVORITES_PATH, favorites)
        return jsonify({"favorites": favorites})

    if request.method == "DELETE":
        favorites = [f for f in favorites if not (f.get("id") == vid and f.get("source") == source)]
        save_json(FAVORITES_PATH, favorites)
        return jsonify({"favorites": favorites})

@app.route("/api/playlists", methods=["GET", "POST"])
def api_playlists():
    playlists = load_json(PLAYLISTS_PATH, {})
    if request.method == "GET":
        return jsonify({"playlists": playlists})

    data = request.get_json() or {}
    action = data.get("action")
    if action == "create":
        name = data.get("name", "New Playlist")
        playlists[name] = {"name": name, "tracks": [], "created_at": None}
        save_json(PLAYLISTS_PATH, playlists)
        return jsonify({"playlists": playlists})
    if action == "delete":
        name = data.get("name")
        if name in playlists:
            del playlists[name]
            save_json(PLAYLISTS_PATH, playlists)
        return jsonify({"playlists": playlists})
    if action == "add":
        name = data.get("name")
        track = {"id": data.get("id"), "source": data.get("source", "youtube")}
        if name not in playlists:
            return jsonify({"error": "playlist not found"}), 404
        playlists[name]["tracks"].append(track)
        save_json(PLAYLISTS_PATH, playlists)
        return jsonify({"playlists": playlists})

    return jsonify({"error": "unknown action"}), 400

if __name__ == "__main__":
    app.run(debug=True, port=5000)
