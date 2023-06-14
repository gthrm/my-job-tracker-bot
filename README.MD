# Job Tracker Bot

Job Tracker Bot is a handy Telegram bot built using Node.js and the Telegraf library, that allows users to keep track of their job applications. The bot is connected with Airtable, a spreadsheet-database hybrid, which is used for storing all job application data.

## Features

- Add new job applications with a company name and job link
- Update the status of your job applications
- Get detailed information about each job application
- All data is securely stored in Airtable

## Getting Started

### Prerequisites

- Node.js v14 or higher
- NPM v6 or higher
- Telegram account
- Airtable account

### Install Dependencies

To install the required dependencies, navigate to the project directory in your terminal and run:

```sh
npm install
```

### Setup Environment Variables

You need to setup the following environment variables in a .env file:

- SERVER_PORT: The port on which your server will run (ex: 3001)
- BOT_TOKEN: Your Telegram bot token
- ALLOWED_ORIGINS: Origins allowed to connect to your bot
- SERVICE_NAME: Name of the bot service (ex: job_bot)
- AIRTABLE_API_KEY: Your Airtable API key
- BASE_ID: The ID of your Airtable base
- BASE_NAME: The name of your Airtable base
- CHANNEL_ID: ID of the Telegram channel where error messages will be sent

### Start the Bot

To start the bot, run:

```sh
npm start
```

Enjoy tracking your job applications with ease!
