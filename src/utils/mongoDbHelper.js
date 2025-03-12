class MongoDbHelper {
  constructor({}) {}

  insertOne(collection, entity) {
    return collection.insertOne(entity);
  }

  insertMany(collection, entity, stopWhenFailed = false) {
    return collection.insertMany(entity, { ordered: stopWhenFailed });
  }

  updateOne(collection, filter, entity, options = {}) {
    return collection.updateOne(filter, { $set: entity }, options);
  }

  upsertOne(collection, filter, entity) {
    return collection.updateOne(filter, { $set: entity }, { upsert: true });
  }

  updateMany(collection, filter, entity) {
    return collection.updateMany(filter, { $set: entity });
  }

  updateManyWithDifferentValues(collection, updates) {
    const bulkOperations = updates.map((update) => ({
      updateOne: {
        filter: update.filter,
        update: { $set: update.update },
      },
    }));

    return collection.bulkWrite(bulkOperations);
  }

  findAll(collection, filter, sort, skip = 0, pageSize = 15) {
    return collection.find(filter).skip(parseInt(skip)).sort(sort).limit(parseInt(pageSize)).toArray();
  }

  countDocuments(collection, filter) {
    return collection.countDocuments(filter);
  }

  findOne(collection, filter) {
    return collection.findOne(filter);
  }

  aggregate(collection, pipeline) {
    try {
      const result = collection.aggregate(pipeline).toArray();
      return result;
    } catch (error) {
      console.error("Error performing aggregate with lookup:", error);
      throw error;
    }
  }

  async aggregateCount(collection, pipeline) {
    try {
      const pipelineWithoutLimit = pipeline.filter((stage) => !stage.$limit);
      const countPipeline = [...pipelineWithoutLimit, { $count: "totalCount" }];
      const result = await collection.aggregate(countPipeline).toArray();

      return result.length > 0 ? result[0].totalCount : 0;
    } catch (error) {
      console.error("Error performing aggregate count with lookup:", error);
      throw error;
    }
  }

  findOneAggregate(collection, pipeline) {
    try {
      const result = collection.aggregate(pipeline).limit(1).next();
      return result;
    } catch (error) {
      console.error("Error performing find one aggregate with lookup:", error);
      throw error;
    }
  }

  findOneAndUpdate(collection, filter, include) {
    return collection.findOneAndUpdate(filter, include);
  }

  deleteOne(collection, filter) {
    return collection.deleteOne(filter);
  }

  deleteMany(collection, filter) {
    return collection.deleteMany(filter);
  }

  softDeleteOne(collection, filter) {
    return collection.updateOne(filter, { $set: { deletedAt: new Date().toISOString() } });
  }
}

module.exports = MongoDbHelper;
