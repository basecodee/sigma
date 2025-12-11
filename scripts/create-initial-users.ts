import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createUser(
  username: string,
  password: string,
  role: 'admin' | 'user',
  fullName?: string
) {
  console.log(`Creating user: ${username}...`);

  const { data: existingProfile } = await supabaseAdmin
    .from('user_profiles')
    .select('username')
    .eq('username', username)
    .maybeSingle();

  if (existingProfile) {
    console.log(`User ${username} already exists, skipping...`);
    return;
  }

  const email = `${username}@payment-dashboard.local`;

  const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        username: username,
        full_name: fullName || null,
      },
    });

  if (authError) {
    console.error(`Error creating auth user ${username}:`, authError.message);
    return;
  }

  if (!authData.user) {
    console.error(`Failed to create user ${username}`);
    return;
  }

  const { error: profileError } = await supabaseAdmin
    .from('user_profiles')
    .insert({
      id: authData.user.id,
      username: username,
      full_name: fullName || null,
      role: role,
      is_active: true,
    });

  if (profileError) {
    console.error(`Error creating profile for ${username}:`, profileError.message);
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    return;
  }

  console.log(`User ${username} created successfully!`);
}

async function main() {
  console.log('Creating initial users...\n');

  await createUser('admin', 'admin123', 'admin', 'Administrator');
  await createUser('user', 'user123', 'user', 'Regular User');
  await createUser('john', 'password123', 'user', 'John Doe');

  console.log('\nAll users created successfully!');
  console.log('\nLogin credentials:');
  console.log('Admin: username=admin, password=admin123');
  console.log('User1: username=user, password=user123');
  console.log('User2: username=john, password=password123');
}

main().catch(console.error);
