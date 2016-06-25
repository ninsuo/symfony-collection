# 2.0.0

`delete` is a reserved name and can't be used as a class property (fixed in #32), the following changes have been made:

- `allow_delete` option have been replaced by `allow_remove`
- `delete` option have been replaced by `remove`
- `before_delete` event have been replaced by `before_remove`
- `after_delete` event have been replaced by `after_remove`

In advanced form themes, delete buttons having class `collection-delete` should now use `collection-remove`.

