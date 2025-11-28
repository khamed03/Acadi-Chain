import s from "../styles/layout.module.css";
export default function Footer(){
  return <footer className={`container ${s.footer}`}>© {new Date().getFullYear()} Acadi-chain — demo frontend</footer>;
}
