import { expect, it } from 'vitest';
import { renderActionEmail } from './action-email';

it('escapes every interpolated value', () => {
  const { html, text } = renderActionEmail({
    heading: '<script>x</script>',
    body: 'Tom & "Jerry"',
    button: 'Go',
    url: 'https://example.com/a?b=1&c="2"',
    footnote: 'Ignore',
  });
  expect(html).not.toContain('<script>');
  expect(html).toContain('Tom &#38; &#34;Jerry&#34;');
  expect(html).toContain('href="https://example.com/a?b=1&#38;c=&#34;2&#34;"');
  expect(text).toContain('Go: https://example.com/a?b=1&c="2"');
});
