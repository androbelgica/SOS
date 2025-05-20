<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

class MainLayoutTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_sees_correct_menu_items()
    {
        $user = User::factory()->create(['role' => 'customer']);

        $response = $this->actingAs($user)
            ->get('/');

        $response->assertInertia(fn (Assert $page) => $page
            ->has('auth.user')
            ->where('auth.user.name', $user->name)
            ->where('auth.user.role', 'customer')
        );
    }

    public function test_guest_sees_login_register_buttons()
    {
        $response = $this->get('/');

        $response->assertInertia(fn (Assert $page) => $page
            ->where('canLogin', true)
            ->where('canRegister', true)
            ->where('auth.user', null)
        );
    }

    public function test_mobile_menu_state_is_preserved()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->get('/');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->has('isMobileMenuOpen')
        );
    }

    public function test_user_dropdown_menu_contains_correct_items()
    {
        $user = User::factory()->create(['role' => 'customer']);

        $response = $this->actingAs($user)
            ->get('/');

        $response->assertInertia(fn (Assert $page) => $page
            ->has('auth.user')
            ->has('routes.profile')
            ->has('routes.dashboard')
            ->has('routes.logout')
        );
    }
}
