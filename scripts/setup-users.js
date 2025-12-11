const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://0ec90b57d6e95fcbda19832f.supabase.co';

const users = [
  {
    username: 'admin',
    password: 'admin123',
    full_name: 'Administrator',
    role: 'admin'
  },
  {
    username: 'user',
    password: 'user123',
    full_name: 'Regular User',
    role: 'user'
  },
  {
    username: 'john',
    password: 'password123',
    full_name: 'John Doe',
    role: 'user'
  }
];

async function createUser(user) {
  try {
    console.log(`Creating user: ${user.username}...`);

    const response = await fetch(`${SUPABASE_URL}/functions/v1/register-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });

    const data = await response.json();

    if (data.status === 'success') {
      console.log(`✓ User ${user.username} created successfully`);
    } else {
      console.log(`✗ Failed to create ${user.username}: ${data.message}`);
    }
  } catch (error) {
    console.error(`✗ Error creating user ${user.username}:`, error.message);
  }
}

async function main() {
  console.log('Creating initial users...\n');

  for (const user of users) {
    await createUser(user);
  }

  console.log('\nSetup complete!');
  console.log('\nLogin credentials:');
  console.log('Admin: username=admin, password=admin123');
  console.log('User1: username=user, password=user123');
  console.log('User2: username=john, password=password123');
}

main().catch(console.error);
