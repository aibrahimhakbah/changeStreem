const { MongoClient } = require('mongodb')
const stream = require('stream');

async function main() {
      const uri = "mongodb+srv://<username>:<password>@<your-cluster-url>/fintech?retryWrites=true&w=majority";
    

      const client = new MongoClient(uri);
      try {
            // Connect to the MongoDB cluster
            await client.connect();
            const pipline = [
                  {
                        '$match' : {'type' : 'debit'}
                  }
            ]
            await monitorListingsUsingEventEmitter(client , 20000)
      }
      finally {
            // Close the connection to the MongoDB cluster
            await client.close();
      }
}

main().catch(console.error)


/**
 * Close the given change stream after the given amount of time
 * @param {*} timeInMs The amount of time in ms to monitor listings
 * @param {*} changeStream The open change stream that should be closed
 */
 function closeChangeStream(timeInMs = 60000, changeStream) {
      return new Promise((resolve) => {
          setTimeout(() => {
              console.log("Closing the change stream");
              changeStream.close();
              resolve();
          }, timeInMs)
      })
  };
  
  /**
   * Monitor listings in the transactions collections for changes
   * This function uses the on() function from the EventEmitter class to monitor changes
   * @param {MongoClient} client A MongoClient that is connected to a cluster with the fintech database
   * @param {Number} timeInMs The amount of time in ms to monitor listings
   * @param {Object} pipeline An aggregation pipeline that determines which change events should be output to the console
   */
  async function monitorListingsUsingEventEmitter(client, timeInMs = 60000, pipeline = []) {
      const collection = client.db("fintech").collection("transactions");
  
      const changeStream = collection.watch(pipeline);
  
      changeStream.on('change', (next) => {
          console.log(next);
      });
  
      // Wait the given amount of time and then close the change stream
      await closeChangeStream(timeInMs, changeStream);
  }
  
  /**
   * Monitor listings in the transactions collections for changes
   * This function uses the hasNext() function from the MongoDB Node.js Driver's ChangeStream class to monitor changes
   * @param {MongoClient} client A MongoClient that is connected to a cluster with the fintech database
   * @param {Number} timeInMs The amount of time in ms to monitor listings
   * @param {Object} pipeline An aggregation pipeline that determines which change events should be output to the console
   */
  async function monitorListingsUsingHasNext(client, timeInMs = 60000, pipeline = []) {
      const collection = client.db("fintech").collection("transactions");
  
      const changeStream = collection.watch(pipeline);
  
       closeChangeStream(timeInMs, changeStream);
  
      try {
          while (await changeStream.hasNext()) {
              console.log(await changeStream.next());
          }
      } catch (error) {
          if (changeStream.isClosed()) {
              console.log("The change stream is closed. Will not wait on any more changes.")
          } else {
              throw error;
          }
      }
  }
  
  /**
   * Monitor listings in the transactions collection for changes
   * This function uses the Stream API (https://nodejs.org/api/stream.html) to monitor changes
   * @param {MongoClient} client A MongoClient that is connected to a cluster with the fintech database
   * @param {Number} timeInMs The amount of time in ms to monitor listings
   * @param {Object} pipeline An aggregation pipeline that determines which change events should be output to the console
   */
  async function monitorListingsUsingStreamAPI(client, timeInMs = 60000, pipeline = []) {
      const collection = client.db('fintech').collection('transactions');
  
      const changeStream = collection.watch(pipeline);
  
      changeStream.stream().pipe(
          new stream.Writable({
              objectMode: true,
              write: function (doc, _, cb) {
                  console.log(doc);
                  cb();
              }
          })
      );
  
      // Wait the given amount of time and then close the change stream
      await closeChangeStream(timeInMs, changeStream);
}
