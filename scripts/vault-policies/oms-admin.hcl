# Full access for administrators
path "secret/data/oms/*" {
  capabilities = ["create", "read", "update", "delete", "list"]
}
path "secret/metadata/oms/*" {
  capabilities = ["create", "read", "update", "delete", "list"]
}
path "secret/delete/oms/*" {
  capabilities = ["update"]
}
path "secret/undelete/oms/*" {
  capabilities = ["update"]
}
