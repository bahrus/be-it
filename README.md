# be-it

*be-it* is a vaguely named custom enhancement for DOM elements, whose mission is rather obscure but quite important.  It allows deriving and forwarding [microdata](https://developer.mozilla.org/en-US/docs/Web/HTML/Microdata) values from meta and link tags to and from properties of other DOM (custom) elements.  "it" stands for "itemized and transformed", if that helps remember the name.  

Basically be-it attempts to fill in some gaps in the microdata specification, as far as specifying a full binding framework.

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

*be-it* also supports hydrating the value in the opposite direction from server rendered HTML:

```html
<link itemprop=isWaiting be-it=disabled🌩️>
<meta itemprop=someNumber itemtype="https://schema.org/Number" be-it=maxLength🌩️>
<input disabled maxlength=37>
```

...updates the microdata so it matches the initial values of the input element.

## Auto-forwarding property to next element sibling:

```html
<link itemprop=isWaiting be-it=disabled>
<meta itemtype="https://schema.org/Number" be-it=maxLength>
<input>
```

*be-it* skips over other link/meta tags when searching for the target element to apply the property to.

To specify, instead, to pass the property to the previous element sibling, or the parent, you will need to switch to JSON mode:

```html
<input>
<link be-it='{
    "prop": "disabled",
    "targetRel": "previousElementSibling"
}'disabled>
<meta itemtype="https://schema.org/Number" be-it=maxLength>

```

## Auto-forwarding property to other peer elements

*be-it* also supports passing the value to multiple elements within the parent element scope, based on markers:

```html
<meta itemprop=path be-it=-name;-id;-html-for;value>
<button class="expander" part=expander be-linked='
    Elevate value property to toggled-node-path marker.
'></button>
<label -html-for part=key class=key itemprop=name></label>

<meta itemprop=type>
<meta itemprop=value be-it=value>
<input -name -id class=value part=value be-linked='
    Elevate $0 property to edited-node marker.
'>
```

These marker-based bindings are given lower priority compared to the primary binding (subject to change).

Editing JSON-in-html can be rather error prone. A [VS Code extension](https://marketplace.visualstudio.com/items?itemName=andersonbruceb.json-in-html) is available to help with that, and is compatible with web versions of VSCode.

## Deriving initial value from SSR

As mentioned above, to support hydrating from server rendered HTML, add the "cloud with lightning" emoji (on windows, flying window + "." and search for cloud with lightning).

```html
<link itemprop=isHappy be-it=checked🌩️>
```
## Two-way binding

be-it supports a two way binding option if the name of the property to share ends with a 🔃 character. (On windows, type flying window + ".", and search for clockwise vertical arrow.)

```html
<link itemprop=isHappy be-it=checked🔃>
<input type=checkbox>
```

This will cause the checkbox to notify the source's isHappy property of the change.

## Conditionally displaying a template element

```html
<link itemprop=isHappy be-it=content-display>
<template>
    <my-content></my-content>
</template>
```

## Transforming peer elements [TODO]

be-it can also disseminate its value to other peer elements within the Shadow DOM realm, using [DTR syntax](https://github.com/bahrus/trans-render#declarative-trans-render-syntax-via-json-serializable-rhs-expressions-with-libdtrjs):

```html
<span><span>
<link itemprop=isHappy be-it='{
    "prop": "checked",
    "twoWay": true,
    "transform": {
        "span": "."
    }
}'>
<input type=checkbox>
```

If different values should be passed based on whether the value of itemprop is truthy or falsy, use the transformIfTruthy, transformIfFalsy properties.



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



