<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Support\Facades\DB;

class DatabaseConfigurationTest extends TestCase
{    public function test_database_configuration()
    {
        $this->assertTrue(
            DB::connection() instanceof \Illuminate\Database\SQLiteConnection,
            'Database connection should be SQLite for testing'
        );

        // For in-memory database, we expect memory journal mode
        $pragmas = DB::select('PRAGMA journal_mode');
        $this->assertEquals(
            'memory',
            strtolower($pragmas[0]->journal_mode),
            'SQLite should be using memory journal mode for :memory: database'
        );

        $foreignKeys = DB::select('PRAGMA foreign_keys');
        $this->assertEquals(
            1,
            $foreignKeys[0]->foreign_keys,
            'Foreign key constraints should be enabled'
        );
    }
}
