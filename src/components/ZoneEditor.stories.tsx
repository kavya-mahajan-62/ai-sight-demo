import type { Meta, StoryObj } from '@storybook/react';
import { ZoneEditor } from './ZoneEditor';
import { useState } from 'react';

const meta: Meta<typeof ZoneEditor> = {
  title: 'Components/ZoneEditor',
  component: ZoneEditor,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ZoneEditor>;

const ZoneEditorWithState = (props: any) => {
  const [zone, setZone] = useState(props.initialZone || []);

  return (
    <div style={{ width: '800px', padding: '20px' }}>
      <ZoneEditor
        {...props}
        initialZone={zone}
        onSave={(newZone) => {
          setZone(newZone);
          console.log('Zone saved:', newZone);
        }}
        onCancel={() => console.log('Cancelled')}
      />
    </div>
  );
};

export const PolygonMode: Story = {
  render: () => (
    <ZoneEditorWithState
      imageUrl="/placeholder.svg"
      mode="polygon"
    />
  ),
};

export const LineMode: Story = {
  render: () => (
    <ZoneEditorWithState
      imageUrl="/placeholder.svg"
      mode="line"
    />
  ),
};

export const WithExistingZone: Story = {
  render: () => (
    <ZoneEditorWithState
      imageUrl="/placeholder.svg"
      mode="polygon"
      initialZone={[
        { x: 0.2, y: 0.2 },
        { x: 0.8, y: 0.2 },
        { x: 0.8, y: 0.8 },
        { x: 0.2, y: 0.8 },
      ]}
    />
  ),
};

export const LineWithExistingZone: Story = {
  render: () => (
    <ZoneEditorWithState
      imageUrl="/placeholder.svg"
      mode="line"
      initialZone={[
        { x: 0.1, y: 0.5 },
        { x: 0.9, y: 0.5 },
      ]}
    />
  ),
};
