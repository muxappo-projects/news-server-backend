# News API

Welcome to my News API backend project!

This project was created during the final week of the Northcoders backend module.

## Summary of practices displayed

- Building up and populating a database with SQL
- Seeding the database using pg-format
- Building the main API using express
- Use of GET, POST, PATCH, and DELETE requests to fetch and manipulate data
- Handling of HTTP and SQL errors in a readable format
- Organisation of functions using MVC
- Hosting of the API using ElephantSQL and Render
- Use of TDD in conjunction with both dev and test databases to make testing various outcomes easier to manage

## To view the hosted version of this project click here: https://news-api-oery.onrender.com/api

### Setup:

- Fork your own version and clone using **git clone <repo_url>**
- Use **npm install** to install required dependencies
- Create the databases with **npm run setup-dbs**
- Seed the databases with **npm run seed**

.env files are required:

- Create a .env file for both development and test data
- In each .env file, enter the following:

_PGDATABASE=nc_news/nc_news_test_

#### Minimum versions:

- **Node.js**: v1.0.0
- **Postgres**: v8.7.3

### Helpful NPM scripts

- **test** <filename>: executes jest on the given file to run tests
- **setup-dbs**: runs psql with setup.sql to create the databases
- **seed**: executes run-seed.js to seed the databases
- **tables**: runs tables.sql (an sql playground file for testing queries), then sends the output to tables.txt at the top level of the directory
