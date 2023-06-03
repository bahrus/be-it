# be-it

be-it is a vaguely named custom enhancement for DOM elements, whose mission is rather obscure but quite important.  It allows forwarding microdata settings / values from meta and link tags to properties of other DOM (custom) elements.

This allows applications to hydrate without having to pass and parse data separately, and provide search engines with accurate information.

It works well with other custom enhancements, including [be-sharing](https://github.com/bahrus/be-sharing) and [be-linked](https://github.com/bahrus/be-linked):

```html
<div itemscope 
    be-scoped='{
        "count": 30,
        "description": "Mr. Banks flying a kite with his kids.",
        "isHappy": true
    }'
    be-sharing='
        Share * from scope.
    '
>
    <link itemprop=isHappy be-it=disabled>
    <meta itemprop=count be-it=maxLength>
    <input>
    <meta itemprop=description be-it=alt>
    <img>
</div>
```

