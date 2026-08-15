import { Fragment } from 'react';

/**
 * Renders a locale's copy lines with a break element between them.
 *
 * Body copy on this site carries deliberate line breaks that differ per locale
 * (Czech words are longer, so the same sentence rarely breaks in the same
 * place). The break element itself stays in the component — some sections use a
 * plain `<br />`, others a `DesktopBr` that disappears below 992 px — so only
 * WHERE the break goes is a translation decision, never how it behaves.
 *
 * The space before the break keeps the lines separated when the break element
 * is hidden by a media query and the two lines reflow into one paragraph.
 */
export function joinLines(lines: readonly string[], br: React.ElementType) {
  /* `br` may be the intrinsic 'br' tag or a styled component; both are valid
     createElement arguments, and this alias is what lets TSX accept either. */
  const Break = br as React.FunctionComponent;

  return lines.map((line, i) => (
    <Fragment key={i}>
      {i > 0 && (
        <>
          {' '}
          <Break />
        </>
      )}
      {line}
    </Fragment>
  ));
}
