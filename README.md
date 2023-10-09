# Car Listing Notifier

This is a discord bot that can be asked to search a website for cars matching specific filters (see .env) and maintain messages in a discord channel representing these cars.

## Bot Commands:

- **/ping**: Responds with "pong" if the bot is alive. For testing purposes.
- **/bulkclear**: Deletes all messages in the channel that the command was sent in.
- **/refresh**: Updated the channel that the command was sent in to match the listings on the website.

**refresh** will:
- Delete any messages which correspond to cars that are no longer listed.
- Edit any messages that still match the filters, but have changed (e.g. price change).
- Create messages for new listings that match the filters.
