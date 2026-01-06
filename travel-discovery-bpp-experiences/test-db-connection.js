const db = require('./src/config/database');

async function testConnection() {
    try {
        console.log('Testing database connection...');
        
        // Test basic connection
        const result = await db.query('SELECT NOW()');
        console.log('✅ Database connected successfully');
        console.log('Current time:', result.rows[0].now);
        
        // Test if experience_bpp database exists
        const dbCheck = await db.query('SELECT current_database()');
        console.log('✅ Connected to database:', dbCheck.rows[0].current_database);
        
        // Test if experiences table exists
        const tableCheck = await db.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'experiences'
        `);
        
        if (tableCheck.rows.length > 0) {
            console.log('✅ Experiences table exists');
            
            // Count experiences
            const countResult = await db.query('SELECT COUNT(*) FROM experiences');
            console.log(`✅ Found ${countResult.rows[0].count} experiences in database`);
            
            // Show sample experiences
            const sampleResult = await db.query('SELECT experience_name, city, category, price FROM experiences LIMIT 3');
            console.log('Sample experiences:');
            sampleResult.rows.forEach(exp => {
                console.log(`  - ${exp.experience_name} (${exp.city}) - ₹${exp.price}`);
            });
        } else {
            console.log('❌ Experiences table does not exist');
            console.log('Please run the experience.sql script to create the database schema');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.error('Make sure PostgreSQL is running and the database exists');
        process.exit(1);
    }
}

testConnection();