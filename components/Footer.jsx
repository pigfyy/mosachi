import styles from "@/styles/Footer.module.css";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className={styles.root}>
      <img src="/logo-circle.png" alt="" className={styles.logo__circle} />
      <img src="/title-logo-white.svg" alt="" className={styles.logo__title} />
      <div className={styles.link__container}>
        <Link href={"/blog"} className={styles.link}>
          Blog
        </Link>
        <Link href={"/terms-and-conditions"} className={styles.link}>
          Terms and Conditions
        </Link>
      </div>
    </footer>
  );
}
