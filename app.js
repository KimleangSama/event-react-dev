const express = require('express')
const bodyParser = require('body-parser')
const graphqlHttp = require('express-graphql')
const {
    buildSchema
} = require('graphql')
const mongoose = require('mongoose')

const app = express()
const port = 3000

const Event = require('./models/event')

app.use(bodyParser.json())
app.use('/graphql', graphqlHttp({
    schema: buildSchema(`
        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        type RootQuery {
            events: [Event!]!
        }

        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        type RootMutation {
            createEvent(event: EventInput): Event 
        }

        schema {
            query: RootQuery,
            mutation: RootMutation
        }
    `),
    rootValue: {
        events: () => {
            return Event.find()
                .then(events => {
                    return events.map(event => {
                        return {...event._doc, _id: event._doc._id.toString()}
                    })
                })
                .catch(err => {
                    console.error(err);
                    throw err
                })
        },
        createEvent: args => {
            const event = new Event({
                title: args.event.title,
                description: args.event.description,
                price: +args.event.price,
                date: new Date(args.event.date)
            })
            return event.save()
                .then(result => {
                    console.log(result);
                    return {...result._doc}
                })
                .catch(err => {
                    console.error(err);
                    throw err
                })
        }
    },
    graphiql: true
}))
mongoose.connect(
    // `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@cluster0-mwlnw.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`
    `mongodb://localhost:27017/events`
).then(() => {
    app.listen(port)
}).catch((err) => {
    console.error(err);
    throw err
})