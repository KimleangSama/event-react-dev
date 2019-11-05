const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const mongoose = require('mongoose');
const isAuth = require('./middleware/is-auth')

const grapqlSchema = require('./graphql/schema/index');
const grapqlResolvers = require('./graphql/resolvers/index');


const app = express();
const port = 3000;

app.use(bodyParser.json());

app.use(isAuth)

app.use('/graphql', graphqlHttp({
    schema: grapqlSchema,
    rootValue: grapqlResolvers,
    graphiql: true
}));
mongoose.connect(
    // `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@cluster0-mwlnw.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`
    `mongodb://localhost:27017/events`
).then(() => {
    app.listen(port)
}).catch((err) => {
    console.error(err);
    throw err
});
