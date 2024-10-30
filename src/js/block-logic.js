import assign from 'lodash.assign';

const { createHigherOrderComponent } = wp.compose;
const { Fragment } = wp.element;
const { InspectorAdvancedControls } = wp.blockEditor;
const { TextareaControl } = wp.components;
const { addFilter } = wp.hooks;
const { __ } = wp.i18n;

/**
 * Add layout control attribute to block.
 *
 * @param {object} settings Current block settings.
 * @param {string} name Name of block.
 *
 * @returns {object} Modified block settings.
 */
const addBlockLogicControlAttribute = ( settings, name ) => {
	// The freeform (Classic Editor) block is incompatible because it does not
	// support custom attributes.
	if ( settings.name === 'core/freeform' ) {
		return settings;
	}

	if (typeof settings.attributes !== 'undefined') {
		const attributes = {
			blockLogic: {
				type: 'string',
				default: '',
			},
		}

		// Use Lodash's assign to gracefully handle if attributes are undefined
		settings.attributes = assign(settings.attributes, attributes);
		settings.supports = assign( settings.supports, {
			blockLogic: true,
		} );
	}

	return settings;
};

addFilter( 'blocks.registerBlockType', 'blockLogic/attribute', addBlockLogicControlAttribute );

/**
 * Create HOC to add layout control to inspector controls of block.
 */
const withLogicControl = createHigherOrderComponent( ( BlockEdit ) => {
	return ( props ) => {
		const { attributes, setAttributes, isSelected } = props;
		const { blockLogic } = attributes;

		// add has-spacing-xy class to block
		if ( blockLogic ) {
			attributes.blockLogic = blockLogic;
		}

		return (
			<Fragment>
				<BlockEdit { ...props } />
				{ isSelected &&
				<InspectorAdvancedControls>
					<TextareaControl
						rows="2"
						label={ __( 'Block Logic', 'block-logic' ) }
						help={ __( 'Add valid PHP conditional tags or PHP condition that returns true or false.', 'block-logic' ) }
						value={ blockLogic ? blockLogic : '' }
						onChange={ ( newValue ) =>
							setAttributes( {
								blockLogic: newValue,
							} )
						}
					/>
				</InspectorAdvancedControls>
				}
			</Fragment>
		);
	};
}, 'withLogicControl' );

addFilter( 'editor.BlockEdit', 'blockLogic/control', withLogicControl );
