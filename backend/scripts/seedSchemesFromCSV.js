const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Scheme = require('../models/Scheme');

const MONGODB_URI = process.env.MONGO_URI;

// Parse CSV and transform to scheme objects
async function seedSchemesFromCSV() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');

    // Delete existing schemes
    console.log('Deleting existing schemes...');
    await Scheme.deleteMany({});
    console.log('All schemes deleted');

    // Read and parse CSV
    const csvFilePath = path.join(__dirname, '../../mp_schemes_output (1).csv');
    const schemes = [];

    return new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => {
          // Only split by actual pipe separator " | " (space-pipe-space)
          // Don't split if pipe is part of description
          const requiredDocs = row.requiredDocuments
            ? row.requiredDocuments.split('|').map(doc => doc.trim()).filter(doc => doc && doc.length < 100)
            : [];

          const eligibility = {
            ageMin: 0,
            ageMax: 120,
            casteCategories: ['SC', 'ST', 'OBC', 'General'],
            gender: ['All'],
            occupations: ['All'],
            incomeMax: null
          };

          const scheme = {
            name: row.schemeName,
            schemeId: row.schemeId,
            description: row.overview,
            department: row.department,
            eligibility: eligibility,
            requiredDocuments: requiredDocs,
            lifeEvents: ['General'],
            benefits: row.financialBenefits || row.nonFinancialBenefits || '',
            applyUrl: row.applicationLink || 'https://saara.mp.gov.in/',
            isActive: row.schemeStatus && row.schemeStatus.toLowerCase().includes('active') ? true : false,
            createdAt: new Date(),
          };

          schemes.push(scheme);
        })
        .on('end', async () => {
          try {
            console.log(`\nImporting ${schemes.length} schemes...`);
            
            // Insert all schemes
            const result = await Scheme.insertMany(schemes);
            console.log(`✅ Successfully imported ${result.length} schemes!`);
            
            // Display summary
            console.log('\n========== IMPORT SUMMARY ==========');
            console.log(`Total Schemes Imported: ${result.length}`);
            result.forEach((scheme, index) => {
              console.log(`${index + 1}. ${scheme.schemeId} - ${scheme.name}`);
            });
            console.log('====================================\n');

            await mongoose.connection.close();
            console.log('MongoDB connection closed');
            process.exit(0);
          } catch (error) {
            console.error('Error inserting schemes:', error.message);
            await mongoose.connection.close();
            process.exit(1);
          }
        })
        .on('error', (error) => {
          console.error('Error reading CSV:', error.message);
          reject(error);
        });
    });
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

seedSchemesFromCSV();
