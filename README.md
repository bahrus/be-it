# be-it

be-it is a vaguely named custom enhancement for DOM elements, whose mission is rather obscure but quite important.  It allows deriving and forwarding microdata settings / values from meta and link tags to and from properties of other DOM (custom) elements.  "it" stands for "itemized and transformed", if that helps remember the name.

This allows applications to hydrate without having to pass and parse data separately, and provide search engines with accurate information.

[![Playwright Tests](https://github.com/bahrus/be-it/actions/workflows/CI.yml/badge.svg)](https://github.com/bahrus/be-it/actions/workflows/CI.yml)
[![NPM version](https://badge.fury.io/js/be-it.png)](http://badge.fury.io/js/be-it)
[![How big is this package in your project?](https://img.shields.io/bundlephobia/minzip/be-it?style=for-the-badge)](https://bundlephobia.com/result?p=be-it)
<img src="http://img.badgesize.io/https://cdn.jsdelivr.net/npm/be-it?compression=gzip">

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

*be-it* also supports hydrating the value in the opposite direction:

```html
<link be-it=disabled>
<meta itemtype="https://schema.org/Number" be-it=maxLength>
<input disabled maxlength=37>
```

...updates the microdata so it matches the initial values of the input element.

## Two-way binding

be-it supports a two way binding option if the name of the property to share ends with a ^ character.

```html
<link itemprop isHappy be-it=checked^>
<input type=checkbox>
```

This will cause the checkbox to notify the source's isHappy property of the change.

## Transforming peer elements [TODO]

be-it can also disseminate its value to other peer elements within the Shadow DOM realm, using [DTR syntax](https://github.com/bahrus/trans-render#declarative-trans-render-syntax-via-json-serializable-rhs-expressions-with-libdtrjs):

```html
<span><span>
<link itemprop isHappy be-it='{
    "prop": "checked",
    "twoWay": true,
    "transform": {
        "span": "."
    }
}'>
<input type=checkbox>
```

If different values should be passed based on whether the value of itemprop is truthy or falsy, use the transformIfTruty, transformIfFalsy properties.

## Viewing Your Element Locally

1.  Install git.
2.  Fork/clone this repo.
3.  Install node.h
4.  Open command window to folder where you cloned this repo.
5.  > npm install
6.  > npm run serve
7.  Open http://localhost:3030/demo/ in a modern browser.

## Running Tests

```
> npm run test
```



