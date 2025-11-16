#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Symbol};

#[derive(Clone)]
#[contracttype]
pub enum EscrowStatus { Open, Released, Refunded }

#[contract]
pub struct ImpactEscrow;

#[contractimpl]
impl ImpactEscrow {
    pub fn initialize(env: Env, admin: Address) {
        if has_init(&env) { panic!("already-initialized"); }
        env.storage().instance().set(&Symbol::new(&env, "init"), &true);
        env.storage().instance().set(&Symbol::new(&env, "admin"), &admin);
    }

    pub fn release(env: Env, admin: Address, donation_id: u32) {
        require_init(&env); admin.require_auth();
        let a: Address = env.storage().instance().get(&Symbol::new(&env, "admin")).unwrap();
        if a != admin { panic!("not-admin"); }
        // TODO: integrate with token manager to transfer funds to NGO
    env.events().publish((Symbol::new(&env, "escrow_released"),), (donation_id, admin));
    }
}

fn has_init(env: &Env) -> bool { env.storage().instance().get::<_, bool>(&Symbol::new(env, "init")).unwrap_or(false) }
fn require_init(env: &Env) { if !has_init(env) { panic!("not-initialized"); } }
