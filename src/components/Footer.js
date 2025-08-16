import "../css/Footer.css";
import { FaGithub } from "react-icons/fa";
import { FaBluesky } from "react-icons/fa6";

export default function Footer() {
    return (
        <footer className="site-footer">
            <div className="footer-content">
                <div className="footer-section">
                    <h4>Contact</h4>
                    <p>
                        <a href="mailto:feedback@example.com">e-mail</a>
                    </p>
                </div>

                <div className="footer-section">
                    <h4>Follow Me</h4>
                    <p>
                        <a
                            href="https://github.com/NanoRossi"
                            aria-label="Github"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <FaGithub />
                        </a>{" "}
                        |{" "}
                        <a
                            href="https://bsky.app/profile/rossoliver.bsky.social"
                            aria-label="Bluesky"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <FaBluesky />
                        </a>
                    </p>
                </div>
            </div>
        </footer>
    );
}
