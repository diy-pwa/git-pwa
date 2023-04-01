import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import Nav from '../components/Nav.jsx';
import { load } from 'cheerio';

describe('nav test', function () {
  it('tests for one only nav', function () {
    const sHtml = renderToString(React.createElement(Nav, {navData: {
        text: 'Logo',
        to: '/',
        items: [{ text: 'Contact', to: 'contact'}],
      }}));
    const $ = load(sHtml);
    expect($('nav').length).toBe(1);
  });
});