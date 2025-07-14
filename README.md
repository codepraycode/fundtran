# FundTran Money Transfer API

![Node.js](https://img.shields.io/badge/Node.js-18-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![MySQL](https://img.shields.io/badge/MySQL-8-orange)

A secure backend for processing financial transactions with bank integrations.

## Features

- 🛡️ JWT Authentication
- 💳 Account management
- 💰 Bank transfers via Raven Atlas
- 🔄 Webhook processing
- 📊 Transaction history

## Tech Stack

- **Backend**: Node.js + Express
- **Database**: MySQL (Dockerized) + Knex
- **API Docs**: Postman
- **Validation**: Joi

## Quick Start

### Prerequisites

- Docker
- Node.js 18+
- Bun (recommended)

### Installation

````bash
git clone https://github.com/codepraycode/fundtran.git
cd fundtran
cp .env.example .env  # Update with your credentials

To install dependencies:

```bash
bun install
````

Knex Migrations:

Ensure to setup mysql and adminer.

Via Docker, run at root:

```bash
docker compose up -d
./migrate latest
```

To run server:

```bash
bun dev
```
