// Add or update demo access keys here. Every account still lands in the same demo dashboard.
const demoAccessAccounts = [
  {
    id: 'main-demo-access',
    displayName: 'Main Demo Access',
    email: 'demo@inflowai.net',
    username: 'demo',
    password: 'inflow-demo',
    initials: 'DM',
  },
  {
    id: 'dev-shortcut',
    displayName: 'Developer Shortcut',
    email: 'dev@inflowai.net',
    username: 'DEdev',
    password: 'dev',
    initials: 'DV',
    aliases: ['dedev', 'dev'],
  },
]

export const primaryDemoAccess = demoAccessAccounts[0]

export function getDemoAccessAccounts() {
  return demoAccessAccounts.map((account) => ({ ...account }))
}

export function getDemoAccessAccountById(accountId) {
  return demoAccessAccounts.find((account) => account.id === accountId) ?? primaryDemoAccess
}

export function resolveDemoAccessAccount(identifier, password) {
  const normalizedIdentifier = String(identifier ?? '').trim().toLowerCase()
  const submittedPassword = String(password ?? '')

  if (!normalizedIdentifier || !submittedPassword) {
    return null
  }

  return (
    demoAccessAccounts.find((account) => {
      const loginKeys = [account.email, account.username, ...(account.aliases ?? [])]
        .filter(Boolean)
        .map((value) => value.toLowerCase())

      return loginKeys.includes(normalizedIdentifier) && account.password === submittedPassword
    }) ?? null
  )
}
