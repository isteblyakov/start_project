$icons: (
sprite: (width: {{spriteWidth}}px, height: {{spriteHeight}}px, svgPath: '../img/sprite.svg'),
{{#shapes}}
{{base}}: (width: {{width.inner}}px, height: {{height.inner}}px, backgroundX: {{position.absolute.x}}px, backgroundY: {{position.absolute.y}}px),
{{/shapes}});