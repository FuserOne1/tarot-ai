const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "../public/cards");

const map = {
  // Major arcana
  "0.jpg":  "the-fool.jpg",
  "1.jpg":  "the-magician.jpg",
  "2.jpg":  "the-high-priestess.jpg",
  "3.jpg":  "the-empress.jpg",
  "4.jpg":  "the-emperor.jpg",
  "5.jpg":  "the-hierophant.jpg",
  "6.jpg":  "the-lovers.jpg",
  "7.jpg":  "the-chariot.jpg",
  "8.jpg":  "strength.jpg",
  "9.jpg":  "the-hermit.jpg",
  "10.jpg": "wheel-of-fortune.jpg",
  "11.jpg": "justice.jpg",
  "12.jpg": "the-hanged-man.jpg",
  "13.jpg": "death.jpg",
  "14.jpg": "temperance.jpg",
  "15.jpg": "the-devil.jpg",
  "16.jpg": "the-tower.jpg",
  "17.jpg": "the-star.jpg",
  "18.jpg": "the-moon.jpg",
  "19.jpg": "the-sun.jpg",
  "20.jpg": "judgement.jpg",
  "21.jpg": "the-world.jpg",

  // Cups (c) — a=ace, r=page, p=knight, q=queen, k=king
  "ac.jpg":  "ace-of-cups.jpg",
  "2c.jpg":  "two-of-cups.jpg",
  "3c.jpg":  "three-of-cups.jpg",
  "4c.jpg":  "four-of-cups.jpg",
  "5c.jpg":  "five-of-cups.jpg",
  "6c.jpg":  "six-of-cups.jpg",
  "7c.jpg":  "seven-of-cups.jpg",
  "8c.jpg":  "eight-of-cups.jpg",
  "9c.jpg":  "nine-of-cups.jpg",
  "10c.jpg": "ten-of-cups.jpg",
  "rc.jpg":  "page-of-cups.jpg",
  "pc.jpg":  "knight-of-cups.jpg",
  "qc.jpg":  "queen-of-cups.jpg",
  "kc.jpg":  "king-of-cups.jpg",

  // Pentacles/Denarii (d)
  "ad.jpg":  "ace-of-pentacles.jpg",
  "2d.jpg":  "two-of-pentacles.jpg",
  "3d.jpg":  "three-of-pentacles.jpg",
  "4d.jpg":  "four-of-pentacles.jpg",
  "5d.jpg":  "five-of-pentacles.jpg",
  "6d.jpg":  "six-of-pentacles.jpg",
  "7d.jpg":  "seven-of-pentacles.jpg",
  "8d.jpg":  "eight-of-pentacles.jpg",
  "9d.jpg":  "nine-of-pentacles.jpg",
  "10d.jpg": "ten-of-pentacles.jpg",
  "rd.jpg":  "page-of-pentacles.jpg",
  "pd.jpg":  "knight-of-pentacles.jpg",
  "qd.jpg":  "queen-of-pentacles.jpg",
  "kd.jpg":  "king-of-pentacles.jpg",

  // Swords (s)
  "as.jpg":  "ace-of-swords.jpg",
  "2s.jpg":  "two-of-swords.jpg",
  "3s.jpg":  "three-of-swords.jpg",
  "4s.jpg":  "four-of-swords.jpg",
  "5s.jpg":  "five-of-swords.jpg",
  "6s.jpg":  "six-of-swords.jpg",
  "7s.jpg":  "seven-of-swords.jpg",
  "8s.jpg":  "eight-of-swords.jpg",
  "9s.jpg":  "nine-of-swords.jpg",
  "10s.jpg": "ten-of-swords.jpg",
  "rs.jpg":  "page-of-swords.jpg",
  "ps.jpg":  "knight-of-swords.jpg",
  "qs.jpg":  "queen-of-swords.jpg",
  "ks.jpg":  "king-of-swords.jpg",

  // Wands (w)
  "aw.jpg":  "ace-of-wands.jpg",
  "2w.jpg":  "two-of-wands.jpg",
  "3w.jpg":  "three-of-wands.jpg",
  "4w.jpg":  "four-of-wands.jpg",
  "5w.jpg":  "five-of-wands.jpg",
  "6w.jpg":  "six-of-wands.jpg",
  "7w.jpg":  "seven-of-wands.jpg",
  "8w.jpg":  "eight-of-wands.jpg",
  "9w.jpg":  "nine-of-wands.jpg",
  "10w.jpg": "ten-of-wands.jpg",
  "rw.jpg":  "page-of-wands.jpg",
  "pw.jpg":  "knight-of-wands.jpg",
  "qw.jpg":  "queen-of-wands.jpg",
  "kw.jpg":  "king-of-wands.jpg",
};

let count = 0;
for (const [from, to] of Object.entries(map)) {
  const src = path.join(dir, from);
  const dst = path.join(dir, to);
  if (fs.existsSync(src)) {
    fs.renameSync(src, dst);
    console.log(`✓ ${from} → ${to}`);
    count++;
  } else {
    console.log(`- skip: ${from} (not found)`);
  }
}
console.log(`\nDone: ${count} files renamed.`);
