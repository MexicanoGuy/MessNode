
# MessNode

A fullstack messenger-like app using Reactjs and Nodejs backend.
Purpose of this project was to learn new libraries such as Reactjs and achieve realtime data handling.
The app itself isn't beautyful, but it isn't the goal of this project.

| Feature             | Description                                                                |
| ----------------- | ------------------------------------------------------------------ |
| Reactjs | Used with react hooks |
| React router | Redirecting users to other components |
| Cloudinary | Image Database/Storing images(chats, user Pfp) |
| EmojiPicker | Custom emoji picking component |
| WebPack | Simple webpack configuration |
| Express | Retrieving data on backend server from sockets |
| Socket.io | Handling app events |
| Postgresql | Relational DB for storing user, chat data |
| Dotenv | Required to store sensitive credentials(DB, APIs) |
| Cors | Used for backend GET/POST methods |


## Run Locally

Clone the project

```bash
  git clone https://github.com/MexicanoGuy/MessNode.git
```

Go to the project's backend/frontend directory

```bash
  cd server / cd client
```

Install dependencies

```bash
  npm install
```
## Environment Variables

Add .env files

```bash
  create dotenv files both in frontend and backend's directory
```

Add .env variables to the frontend directory

| Api            | Variable name    |
| ----------------- | ------------------------------------------------------------------ |
| Cloudinary name | REACT_APP_CNAME |
| Api key | REACT_APP_CAPIKEY |
| Cloudinary secret | REACT_APP_CSECRET |
| Upload preset | REACT_APP_CUPLOAD_PRESET |
| Backend server URL(optional if locally) | REACT_APP_BACKEND_SERVER_URL |

Add .env PostgreSQL variables to the backend directory

| Api            | Variable name    |
| ----------------- | ------------------------------------------------------------------ |
| database name | DATABASE_NAME |
| host | DATABASE_HOST |
| password | DATABASE_PWD |
| user | DATABASE_USER |
| port | DATABASE_PORT |

Start the backend/frontend server(both individually)

```bash
  npm start
```


## Screenshots

Login Page
![No screenshot](/client/src/img/screenshot1.png?raw=true "Image Error")

App Page
![No screenshot](/client/src/img/screenshot2.png?raw=true "Image Error")
## Testing Live

App is being hosted on vercel: https://mess-node.vercel.app
## Author

- [@MexicanoGuy](https://www.github.com/MexicanoGuy)


## License

[UNLICENSED]UNLICENSED

