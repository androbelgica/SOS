<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;

abstract class TestCase extends BaseTestCase
{
    use CreatesApplication;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Ensure we're using the test database
        config(['database.default' => 'sqlite']);
        config(['database.connections.sqlite.database' => ':memory:']);

        if (DB::connection() instanceof \Illuminate\Database\SQLiteConnection) {
            DB::statement('PRAGMA foreign_keys = ON');
            DB::statement('PRAGMA journal_mode = MEMORY');
            DB::statement('PRAGMA synchronous = OFF');
            DB::statement('PRAGMA temp_store = MEMORY');
            DB::statement('PRAGMA cache_size = -2000'); // Set cache size to 2MB
        }
    }

    protected function tearDown(): void
    {
        DB::disconnect();
        parent::tearDown();
    }
}
