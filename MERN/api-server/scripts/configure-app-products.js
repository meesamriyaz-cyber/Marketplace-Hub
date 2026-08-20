import 'dotenv/config';
import mongoose from 'mongoose';
import { Product } from '../src/models/Product.js';

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('Missing MONGODB_URI (or MONGO_URI) in the API server environment.');
  process.exit(1);
}

try {
  await mongoose.connect(MONGO_URI);

  const products = await Product.find().select('_id name category app').sort({ createdAt: 1 }).lean();

  if (!products.length) {
    console.log('No products found. Nothing to configure.');
    process.exit(0);
  }

  console.log(`Found ${products.length} existing marketplace product(s):`);
  products.forEach((product, index) => {
    console.log(`${index + 1}. ${product.name} [${product.category}]`);
  });

  const result = await Product.updateMany(
    {},
    {
      $set: {
        'app.isApp': true,
        'app.platform': 'multi',
        'app.version': '1.0.0',
        'app.downloadUrl': '',
        'app.downloadEnabled': false,
        'app.trialDays': 7,
      },
    },
  );

  console.log(`\nConfigured ${result.modifiedCount} product(s) for Phase 3A.`);
  console.log('All existing products are now trial-enabled app listings.');
  console.log('Real download URLs remain disabled until the actual installers are hosted.');
} catch (error) {
  console.error('Failed to configure app products:', error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
