# Count Grid Spec

## Initial State

1. The grid displays a vertical number line starting from zero.
    1. Each number is dark gray to indicate that is it not active.
        1. Use four-character hex values to specify opacity, such as `#FFF4` so that the opacity of the text doesn't affect any other opacity of the element.
2. Unicode fruit icons are scattered around the grid.
    1. Each fruit is 80% transparent to indicate that it is not active.
    2. Fruits are not placed in the column next to the numger line.
    3. Fruits are not placed directly next to each other.

## Game Play

1. The user selects a fruit.
    1. That fruit becomes active.
        1. The opacity becomes 100%
    2. A line is animated from the fruit to the next available innactive counting number.
    3. The attached number becomes active.
        1. Opacity becomes 100%
    4. The attached number is put in the `div.cell-superscript` element in the fruit div.
2. The user can de-select the last counting number activated by tapping on it.
    1. The number becomes inactive.
    2. The line is removed.
    3. The fruit it was attached to becomes inactive.
