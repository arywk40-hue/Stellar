#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Symbol};

#[derive(Clone)]
#[contracttype]
pub struct NGO {
    pub id: u32,
    pub name: soroban_sdk::String,
    pub wallet: Address,
    pub verified: bool,
}

#[contract]
pub struct NGOVerification;

#[contractimpl]
impl NGOVerification {
    pub fn initialize(env: Env, admin: Address) {
        if has_init(&env) { panic!("already-initialized"); }
        env.storage().instance().set(&Symbol::new(&env, "init"), &true);
        env.storage().instance().set(&Symbol::new(&env, "admin"), &admin);
        env.storage().instance().set(&Symbol::new(&env, "next_id"), &0u32);
    }

    pub fn register(env: Env, caller: Address, name: soroban_sdk::String, wallet: Address) -> u32 {
        require_init(&env);
        caller.require_auth();
        let id = next_id(&env);
        let ngo = NGO { id, name, wallet: wallet.clone(), verified: false };
        env.storage().instance().set(&(Symbol::new(&env, "ngo"), id), &ngo);
    env.events().publish((Symbol::new(&env, "ngo_registered"),), (id, wallet.clone()));
        id
    }

    pub fn set_verified(env: Env, admin: Address, ngo_id: u32, verified: bool) {
        require_init(&env);
        admin.require_auth();
        let stored_admin: Address = env.storage().instance().get(&Symbol::new(&env, "admin")).unwrap();
        if stored_admin != admin { panic!("not-admin"); }
        let mut ngo: NGO = env.storage().instance().get(&(Symbol::new(&env, "ngo"), ngo_id)).unwrap();
        ngo.verified = verified;
        env.storage().instance().set(&(Symbol::new(&env, "ngo"), ngo_id), &ngo);
    env.events().publish((Symbol::new(&env, "ngo_verified"),), (ngo_id, verified));
    }

    pub fn get(env: Env, ngo_id: u32) -> NGO {
        require_init(&env);
        env.storage().instance().get(&(Symbol::new(&env, "ngo"), ngo_id)).unwrap()
    }

    pub fn is_verified(env: Env, ngo_id: u32) -> bool {
        require_init(&env);
        let ngo: NGO = env.storage().instance().get(&(Symbol::new(&env, "ngo"), ngo_id)).unwrap();
        ngo.verified
    }
}

fn has_init(env: &Env) -> bool { env.storage().instance().get::<_, bool>(&Symbol::new(env, "init")).unwrap_or(false) }
fn require_init(env: &Env) { if !has_init(env) { panic!("not-initialized"); } }
fn next_id(env: &Env) -> u32 { let mut id = env.storage().instance().get::<_, u32>(&Symbol::new(env, "next_id")).unwrap_or(0); id+=1; env.storage().instance().set(&Symbol::new(env, "next_id"), &id); id }
