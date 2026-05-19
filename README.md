<div align="center">
<br/>

# <img src="https://dearnotes.shabox.dev/assets/img/tab-icon.png" height="32" /> DearNotes

### *A shared wall for two. Leave a note, draw something, disappear after 24h.*

<br/>

[![Open the app](https://img.shields.io/badge/✨_Open_the_app-app.dearnotes.shabox.dev-f4a0b5?style=for-the-badge&labelColor=fde8ef)](https://app.dearnotes.shabox.dev)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Vanilla JS](https://img.shields.io/badge/Vanilla_JS-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
<br/>

</div>

---

<br/>

## What is DearNotes?

**DearNotes** is a private, ephemeral shared wall for couples.

Post sticky notes, small sketches, and little moments - they live for **24 hours**, then quietly disappear. If a day goes by without anything new, a random past memory resurfaces for 24h, as a gentle reminder of something you once shared.

> *Not a chat app. Not a feed. Just a quiet little space between two people.*

<br/>

## Get started

No install. No setup. Just open the app and invite your partner.

[![Open the app](https://img.shields.io/badge/Open_the_app-%F0%9F%94%97%E2%80%8B-f4a0b5?style=for-the-badge&labelColor=fde8ef)](https://app.dearnotes.shabox.dev)

1. Create an account
2. Invite your partner with a code
3. Start leaving notes 

<br/>

## Features

| | |
|---|---|
| 📝 **Post-its & drawings** | Leave sticky notes or small hand-drawn sketches on your shared wall |
| ⏳ **Ephemeral by design** | Notes disappear after 24 hours, keeping the wall always fresh |
| 🎞️ **Random memories** | If the wall goes quiet, a past note resurfaces for the day |
| 💑 **Coupled accounts** | One wall, two people - invite with a simple code |

<br/>

## Tech stack

- **Frontend** - HTML · CSS · Vanilla JavaScript
- **Backend** - Node.js · Express
- **ORM** - Prisma
- **Database** - MySQL

<br/>

## Run your own instance

The code is open source - if you're a developer and want to host your own version, you're welcome to.

```bash
git clone https://github.com/Shahito/dearnotes.git
cd dearnotes
npm install
cp .env.example .env   # fill in your DB credentials
npx prisma migrate dev --name init
npm run dev
```

<br/>

## License

MIT - code is yours to use, just don't claim it as your own 💛

---

<div align="center">

Made with love by Shahito, for two &nbsp;💌

</div>