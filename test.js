/**
 * This script can be used to replace cron jobs by change streams.
 * This script is especially helpful when testing change streams.
 */
 const { MongoClient } = require('mongodb');

 async function main() {
     
      var uri = "mongodb+srv://ahmed2020:DNSh3ZYhAre1V4x5@cluster0.mwuzi.mongodb.net/fintech";
 
     const client = new MongoClient(uri);
 
     try {
         // Connect to the MongoDB cluster
         await client.connect();
 
         // Make the appropriate DB calls
         const transactionA = await createListing(client, {
             ref: "#61028095345b1b27951ffbd7",
             summary: "views of the iconic Sydney Opera House",
             type: "debit",
             value: 1000,
             currency: 'USD',
             beds: 1,
             address: {
                 market: "Sydney",
                 country: "Australia"
             },
             time: new Date()
         });
 
         const transactionB = await createListing(client, {
            ref: "#1521-md-20022",
            summary: "iconic Sydney Opera House",
            type: "debit",
            value: 1350,
            currency: 'USD',
            time: new Date()
         });
 
         const transactionC = await createListing(client, {
            ref: "#61028095345b1b27951ffbd6",
            summary: "Beautiful apartment with views of the iconic Sydney Opera House",
            type: "debit",
            value: 1000,
            currency: 'USD',
            time: new Date()
         });
 
         await updateListing(client, transactionA, { value: 2000 });
 
         await updateListing(client, transactionB, {
             address: {
                 market: "Cairo",
                 country: "EGYPT"
             }
         });
 
         const transactionD = await createListing(client, {
            ref: "#1521-cd-20020",
            summary: "Beautiful apartment with views of the iconic Sydney Opera House",
            type: "credit",
            value: 700,
            currency: 'USD',
            address: {
                 market: "USA",
                 country: "LA"
             },
             time: new Date()
         });
 
         await deleteListing(client, transactionB);
 
     } finally {
         // Close the connection to the MongoDB cluster
         await client.close();
     }
 }
 
 main().catch(console.error);
 
 /**
  * Create a new Airbnb listing
  * @param {MongoClient} client A MongoClient that is connected to a cluster with the fintech database
  * @param {Object} newListing The new listing to be added
  * @returns {String} The id of the new listing
  */
 async function createListing(client, newListing) {
     // See http://bit.ly/Node_InsertOne for the insertOne() docs
     const result = await client.db("fintech").collection("transactions").insertOne(newListing);
     console.log(`New transaction created with the following id: ${result.insertedId}`);
     return result.insertedId;
 }
 
 /**
  * Update an Airbnb listing
  * @param {MongoClient} client A MongoClient that is connected to a cluster with the fintech database
  * @param {String} listingId The id of the listing you want to update
  * @param {object} updatedListing An object containing all of the properties to be updated for the given listing
  */
 async function updateListing(client, listingId, updatedListing) {
     // See http://bit.ly/Node_updateOne for the updateOne() docs
     const result = await client.db("fintech").collection("transactions").updateOne({ _id: listingId }, { $set: updatedListing });
 
     console.log(`${result.matchedCount} document(s) matched the query criteria.`);
     console.log(`${result.modifiedCount} document(s) was/were updated.`);
 }
 
 /**
  * Delete an listing
  * @param {MongoClient} client A MongoClient that is connected to a cluster with the fintech database
  * @param {String} listingId The id of the listing you want to delete
  */
 async function deleteListing(client, listingId) {
     // See http://bit.ly/Node_deleteOne for the deleteOne() docs
     const result = await client.db("fintech").collection("transactions").deleteOne({ _id: listingId });
 
     console.log(`${result.deletedCount} document(s) was/were deleted.`);
 }