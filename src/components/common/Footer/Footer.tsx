import Logo from "@/src/components/common/Logo/Logo";
import { BlogLink, DiscordLink } from "@/src/utils/constants";

import styles from "./Footer.module.css";
import clsx from "clsx";

const Footer = () => {

  return (
    <>
      <footer className={clsx("mobileOnly", styles.footer)}>
        <div className={styles.content}>
          <Logo isFooter={true} />
          <div className={styles.links}>
            <a className={styles.link} href={DiscordLink}>
              Support
            </a>
            <a href="https://docs.mira.ly/resources/media-kit" target="_blank">
              Media Kit
            </a>
            <a href="https://docs.mira.ly" target="_blank">
              Docs
            </a>
            <a href={BlogLink} target="_blank">
              Blog
            </a>
            <a href="https://docs.mira.ly/resources/careers" target="_blank">
              Careers
            </a>
            <a href="mailto:help@mira.ly" target="_blank">
              Contact us
            </a>
          </div>
        </div>
      </footer>
      <footer className={clsx("desktopOnly", styles.footer)}>
        <div className={styles.content}>
          <Logo isFooter={true} />
          <div className={styles.links}>
            <a className={styles.link} href={DiscordLink}>
              Support
            </a>
            <a
              className={styles.link}
              href="https://docs.mira.ly/resources/media-kit"
              target="_blank"
            >
              Media Kit
            </a>
            <a
              className={styles.link}
              href="https://docs.mira.ly/developer-guides/security-audit"
              target="_blank"
            >
              Security Audit
            </a>
            <a
              className={styles.link}
              href="https://docs.mira.ly"
              target="_blank"
            >
              Docs
            </a>
            <a className={styles.link} href={BlogLink} target="_blank">
              Blog
            </a>
            <a
              className={styles.link}
              href="https://docs.mira.ly/resources/careers"
              target="_blank"
            >
              Careers
            </a>
            <a
              className={styles.link}
              href="mailto:help@mira.ly"
              target="_blank"
            >
              Contact us
            </a>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
