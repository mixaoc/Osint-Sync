# osint-sync - Professional OSINT Browser Extension

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Chrome Web Store](https://img.shields.io/badge/Chrome-Extension-blue.svg)](https://chrome.google.com/webstore)
[![Firefox Add-on](https://img.shields.io/badge/Firefox-Add--on-orange.svg)](https://addons.mozilla.org/)
[![Version](https://img.shields.io/badge/version-1.1-green.svg)]()

A powerful browser extension for Open Source Intelligence (OSINT) research. Search usernames, emails, and phone numbers across 20+ platforms with integrated access to premium OSINT tools like GHunt, IntelX, Epieos, and OSINT Industries.

---

## Features

### Username Search
Search any username across multiple platforms instantly:
- Social Media: Instagram, Twitter/X, Facebook, YouTube, TikTok, Snapchat, Threads, Reddit
- Developer Platforms: GitHub, GitLab  
- Gaming: Minecraft, Steam, Xbox, Twitch
- Professional: Gravatar, LinkedIn (via email)

### Advanced Email Intelligence
Powered by industry-leading OSINT APIs:
- **GHunt**: Google account analysis, profile pictures, Maps activity, YouTube data
- **Epieos**: Email breach detection and data leak monitoring
- **IntelX**: Deep web intelligence and historical data
- **OSINT Industries**: Professional-grade email investigation
- **Holehe**: Social media account detection linked to emails
- Email validation and verification

### Phone Number Investigation
- WhatsApp presence verification
- Carrier and location information
- Social media account detection
- Number validation and formatting
- International support (200+ countries)

### Search History & Management
- Track all your searches in one place
- Export results for reports
- Clear history anytime
- Organized by date and type

### Context Menu Integration
- Right-click any selected text on webpages
- Instant search without copy-paste
- Seamless OSINT workflow

---

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **APIs**: REST API integration with multiple OSINT platforms
- **Storage**: Chrome/Firefox Storage API (local storage)
- **Authentication**: Secure token-based authentication
- **Security**: HTTPS, bcrypt password hashing, rate limiting

---

## Installation

### Chrome Web Store (Recommended)
1. Visit [Chrome Web Store](#) (link coming soon)
2. Click "Add to Chrome"
3. Pin the extension to your toolbar
4. Create your account and start searching

### Firefox Add-ons
1. Visit [Firefox Add-ons](#) (link coming soon)
2. Click "Add to Firefox"
3. Pin the extension to your toolbar
4. Create your account and start searching

### Manual Installation (Development)

#### For Chrome/Edge:
```bash
1. Download or clone this repository
   git clone https://github.com/mixaoc/osint-sync.git

2. Open Chrome/Edge and go to chrome://extensions/

3. Enable "Developer mode" (toggle in top right)

4. Click "Load unpacked"

5. Select the extension folder

6. The extension is now installed
```

#### For Firefox:
```bash
1. Download or clone this repository
   git clone https://github.com/mixaoc/osint-sync.git

2. Open Firefox and go to about:debugging

3. Click "This Firefox"

4. Click "Load Temporary Add-on"

5. Select the manifest.json file

6. The extension is now installed
```

---

## How to Use

### Basic Search
1. Click the osint-sync icon in your browser toolbar
2. Select the search type (Username, Email, or Phone)
3. Enter your search query
4. Click "Search"
5. View comprehensive results from multiple sources

### Context Menu Search
1. Select any text on a webpage (username, email, or phone number)
2. Right-click on the selected text
3. Choose "Search with osint-sync"
4. Results appear instantly in the popup

### Managing History
1. Click the "History" tab
2. View all your past searches
3. Click "Refresh" to update
4. Click "Clear History" to delete all records

---

## Privacy & Security

We take your privacy seriously:

- No data selling to third parties
- No advertising or behavioral tracking
- All passwords are hashed with bcrypt
- All API communications are encrypted (HTTPS only)
- Data stored locally on your device
- GDPR and CCPA compliant
- Open-source and auditable code

**Privacy Policy**: [https://mixaoc.com/confidential.php](https://mixaoc.com/confidential.php)

---

## Integrated OSINT APIs

osint-sync provides access to premium OSINT tools:

| API | Description | Use Case |
|-----|-------------|----------|
| **GHunt** | Google account intelligence | Email profiling, Maps activity |
| **IntelX** | Intelligence database | Deep web searches, historical data |
| **Epieos** | Email & phone OSINT | Breach detection, account discovery |
| **OSINT Industries** | Professional OSINT platform | Enterprise-grade investigations |
| **Holehe** | Social media detection | Find accounts linked to emails |
| **PlayerDB** | Gaming profiles | Minecraft, Steam, Xbox searches |
| **GitHub API** | Developer profiles | Open source contributions |
| **Reddit API** | User profiles | Post history, karma, account age |
| **Twitch API** | Streamer profiles | Channel info, followers |
| **Public APIs** | Various platforms | Instagram, Twitter, TikTok, etc. |

---

## Credit System

osint-sync uses a fair credit system:
- Each search costs 1 credit
- New users receive free credits upon registration
- Affordable credit packages available
- Credits never expire
- Prevents abuse while providing generous free usage

**Purchase Credits**: Available in the extension's "Credits" tab

---

## Development

### Prerequisites
- Node.js (optional, for development tools)
- Modern browser (Chrome, Firefox, Edge)
- Text editor (VS Code recommended)

### Project Structure
```
osint-sync/
│
├── manifest.json           # Extension manifest (Chrome/Firefox)
├── popup.html             # Main popup interface
├── popup.js               # Popup logic and API calls
├── background.js          # Background service worker
├── styles.css             # UI styling
├── privacy-policy.php     # Privacy policy page
│
├── icons/                 # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
│
└── README.md             # This file
```

### Building from Source

```bash
# Clone the repository
git clone https://github.com/mixaoc/osint-sync.git

# Navigate to directory
cd osint-sync

# No build step required - pure HTML/CSS/JS
# Just load the extension in your browser (see Installation)
```

### API Configuration

The extension connects to:
- **Main API**: `https://mixaoc.com/extension/api.php`
- **Server**: `http://147.185.221.31:55641`

For development, you may need to set up your own backend API.

---

## Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Contribution Guidelines
- Follow existing code style
- Test your changes thoroughly
- Update documentation as needed
- Add comments for complex logic
- Respect user privacy in all features

---

## Bug Reports & Feature Requests

Found a bug or have an idea? We'd love to hear from you!

- **Bug Reports**: [Open an issue](https://github.com/mixaoc/osint-sync/issues) with detailed steps to reproduce
- **Feature Requests**: [Open an issue](https://github.com/mixaoc/osint-sync/issues) describing the feature and use case
- **Security Issues**: Email directly to `admin@mixaoc.com` (do not post publicly)

---

## Legal & Ethical Use

**osint-sync is designed for legal and ethical OSINT research only.**

### Acceptable Use:
- Security research and penetration testing
- Background checks for employment
- Journalism and investigative reporting
- Academic research
- Due diligence investigations
- Fraud detection and prevention
- Missing persons investigations

### Prohibited Use:
- Stalking, harassment, or threatening behavior
- Identity theft or fraud
- Unauthorized access to private accounts
- Violation of platform Terms of Service
- Illegal surveillance or espionage
- Doxxing or malicious disclosure of personal information

**Users are solely responsible for complying with all applicable laws and regulations.**

---

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 @mixaoc

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## Links

- **Website**: [https://mixaoc.com](https://mixaoc.com)
- **GitHub**: [https://github.com/mixaoc](https://github.com/mixaoc)
- **Chrome Web Store**: Coming Soon
- **Firefox Add-ons**: Coming Soon
- **Privacy Policy**: [https://mixaoc.com/extension/privacy-policy.php](https://mixaoc.com/extension/privacy-policy.php)
- **Support Email**: admin@mixaoc.com

---

## Support

Need help? Have questions?

- **Email**: admin@mixaoc.com
- **GitHub Issues**: [Open an issue](https://github.com/mixaoc/osint-sync/issues)
- **Website**: [mixaoc.com](https://mixaoc.com)

**Response Time**: We aim to respond within 24-48 hours.

---

## Roadmap

### Version 1.2 (Coming Soon)
- LinkedIn profile search integration
- Advanced filtering and export options
- Dark/Light theme toggle
- Bulk search capability
- API rate limit optimization

### Version 1.3 (Planned)
- Discord account detection
- Telegram username search
- Image reverse search integration
- PDF report generation
- Browser bookmarks sync

### Version 2.0 (Future)
- Mobile app companion
- Team collaboration features
- Custom API integrations
- Machine learning insights
- Advanced data visualization

---

## Acknowledgments

Special thanks to:
- **GHunt** - For excellent Google account OSINT capabilities
- **IntelX** - For comprehensive intelligence database access
- **Epieos** - For email and phone investigation tools
- **OSINT Industries** - For professional-grade OSINT platform
- **Holehe** - For social media account detection
- All open-source contributors and the OSINT community

---

## Screenshots

![osint-sync Interface](https://mixaoc.com/lib/mixaoc.png)

![Dashboard Preview](https://mixaoc.com/extension/image/1.png)

![Search Results](https://mixaoc.com/extension/image/2.png)

![Real-time Analytics](https://mixaoc.com/extension/image/3.png)

![Email Intelligence](https://mixaoc.com/extension/image/6.png)

![Phone Investigation](https://mixaoc.com/extension/image/9.png)

![Username Search](https://mixaoc.com/extension/image/11.png)

![Advanced Features](https://mixaoc.com/extension/image/43.png)

![Live Monitoring](https://mixaoc.com/extension/image/54.png)

![Platform Coverage](https://mixaoc.com/extension/image/333.png)

![Security Features](https://mixaoc.com/extension/image/555.png)

![UI Showcase](https://mixaoc.com/extension/image/343434.png)

![Integration Demo](https://mixaoc.com/extension/image/343443.png)

![Performance Metrics](https://mixaoc.com/extension/image/XX.png)

![Mobile Interface](https://mixaoc.com/extension/image/Capture%20d%E2%80%99%C3%A9cran%202025-11-15%20050619.png)

---

## Video Tutorials

### Installation Guide
[![How To Install Osint Sync (Chrome)](https://img.youtube.com/vi/UZHlXSaaxR8/0.jpg)](https://www.youtube.com/watch?v=UZHlXSaaxR8)

### Usage Tutorial
[![How To Use Osint Sync (Chrome)](https://img.youtube.com/vi/bS95y-vG40M/0.jpg)](https://www.youtube.com/watch?v=bS95y-vG40M)

---

**Made by [@mixaoc](https://github.com/mixaoc)**
