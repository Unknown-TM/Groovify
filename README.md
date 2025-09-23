# 🎵 Groovify - Personal Music Player Framework

Groovify — A sleek, web-based music player with a dark UI. Supports streaming from multiple sources (like YouTube & SoundCloud) with smart search, genre browsing, and personal libraries (Favorites, History, Playlists)

> **Educational Project**: This is a learning framework demonstrating how to build a music player using public tools and APIs. Perfect for understanding streaming architecture, caching strategies, and modern web development.

![Python](https://img.shields.io/badge/Python-3.8+-blue) ![Flask](https://img.shields.io/badge/Flask-2.3.3-green) ![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ Features

### 🎓 Learning Framework
- **Multi-Source Architecture**: Demonstrates how to integrate different streaming sources
- **Caching Strategy**: Shows intelligent metadata and search result caching
- **Streaming Proxy**: Teaches audio streaming without downloads
- **Modern Web Stack**: Flask backend with vanilla JavaScript frontend

### 🎵 Player Features
- **Multi-Source Streaming**: YouTube & SoundCloud support
- **Music Management**: Favorites, playlists, search history
- **Advanced UI**: Sparkles background, animated buttons, responsive design
- **Player Controls**: Full playback, repeat modes, shuffle, keyboard shortcuts
- **Search & Discovery**: Real-time search, category browsing, caching

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- pip

### Installation
```bash
# Clone repository
git clone https://github.com/Unknown-TM/Media_Player_With_ytdlp.git
cd Media_Player_With_ytdlp

# Create virtual environment
python -m venv .venv
.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Setup configuration (optional)
cp .env.example .env
# Edit .env with your API keys if desired

# Run application
python app.py
```

Open `http://localhost:5000` in your browser.

## 🛠️ Tech Stack

**Backend:** Flask 2.3.3, yt-dlp 2024.12.13, requests 2.31.0  
**Frontend:** Vanilla JavaScript, CSS3, HTML5, Custom Fonts  
**Storage:** Local JSON files

## ⚙️ Configuration

Copy `.env.example` to `.env` and configure your settings:

```bash
cp .env.example .env
```

**Optional API Keys:**
- **YouTube Data API**: For enhanced search features (get from [Google Console](https://console.developers.google.com/))
- **SoundCloud API**: For enhanced SoundCloud features

## 🎯 Usage

- **Search**: Enter query, select source (YouTube/SoundCloud), click play
- **Favorites**: Click 🤍 to add, ❤️ to remove
- **Controls**: Space (play/pause), ←/→ (prev/next), M (mute), R (repeat), S (shuffle)
- **Categories**: Click genre cards for auto-search

## ⚠️ Disclaimer

**This project is for personal and educational purposes only.**

- It demonstrates how to build a music player using public tools and APIs
- It is **not affiliated with or endorsed by YouTube or SoundCloud**
- Please respect YouTube's and SoundCloud's Terms of Service when using this project
- This framework focuses on **streaming only** - no content downloads
- Use responsibly and respect copyright laws

## 🚀 Deployment

**Local:** `python app.py`  
**Production:** `pip install gunicorn && gunicorn -w 4 -b 0.0.0.0:5000 app:app`

## 🐛 Troubleshooting

- **Audio issues**: Check yt-dlp installation, internet connection
- **Search problems**: Clear browser cache, check console errors
- **Performance**: Reduce sparkle density, restart app

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow PEP 8 style guidelines
- Add comments for complex functions
- Test your changes thoroughly
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **yt-dlp** - For excellent YouTube/SoundCloud extraction capabilities (external dependency)
- **Flask** - For the robust web framework
- **Contributors** - Thanks to all contributors who help improve this educational project
- **Open Source Community** - For the tools and libraries that make this learning project possible

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/Unknown-Tm/Media_Player_With_ytdlp/issues) page
2. Create a new issue with detailed information
3. Join our community discussions

---

**Made for developers and music lovers everywhere**  
*Educational framework - Use responsibly and respect copyright laws!*
