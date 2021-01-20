# Schema for user data

**Work in progress:** More fields will be added as needed.

- Should be unique per user

```
{
    "values": [
        ...
        {
            "name": string,
            "description": string,
            "notes": array of string
        }
        ...
    ],
    "habits": [
        ...
        {
            "name": string,
            "values": array of values identified by name
            "notes": array of string
        }
        ...
    ]
}
```
