import "../css/Footer.css";

export default function Footer() {
    return (
        <footer className="site-footer">
            <div className="footer-links">
                <a href="mailto:feedback@example.com">E-Mail</a>
                <a
                    href="https://github.com/NanoRossi"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    GitHub
                </a>
                <a
                    href="https://bsky.app/profile/rossoliver.bsky.social"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Bluesky
                </a>
            </div>
        </footer>
    );
}
