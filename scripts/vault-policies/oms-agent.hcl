# Read-only access for CI/CD agents
path "secret/data/oms/*" {
  capabilities = ["read", "list"]
}
path "secret/metadata/oms/*" {
  capabilities = ["read", "list"]
}
