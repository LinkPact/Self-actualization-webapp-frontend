# Schema for user data
__Work in progress:__ More fields will be added as needed.

- Should be unique per user

```
{
    "values": [
        ...
        {
            "name": string,
            "description": string
        }
        ...
    ],
    "habits": [
        ...
        {
            "name": string,
            "values": array of values identified by name 
        }
        ...
    ]
}
```
