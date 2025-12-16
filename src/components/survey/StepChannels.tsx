/**
 * Step 3: Discovery/Purchase Channels
 * 
 * Multi-select step for choosing how users discover/purchase products.
 * Includes an "Other" option with text input.
 */

'use client';

import { motion } from 'framer-motion';
import { SelectionCard } from './SelectionCard';
import { Input } from '@/components/ui/input';
import { CHANNELS, CHANNEL_LABELS, Channel } from '@/types/survey';

interface StepChannelsProps {
  /** Currently selected channels */
  value: Channel[];
  /** Text for "other" channel */
  otherText: string;
  /** Called when channel selection changes */
  onChange: (channels: Channel[]) => void;
  /** Called when other text changes */
  onOtherTextChange: (text: string) => void;
}

export function StepChannels({
  value,
  otherText,
  onChange,
  onOtherTextChange,
}: StepChannelsProps) {
  const handleToggle = (channel: Channel) => {
    if (value.includes(channel)) {
      // Remove channel
      onChange(value.filter((c) => c !== channel));
    } else {
      // Add channel
      onChange([...value, channel]);
    }
  };

  const isOtherSelected = value.includes('other');

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Question header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">
          Where do you usually discover or purchase products?
        </h2>
        <p className="text-gray-500">
          You can select multiple options.
        </p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {CHANNELS.map((channel, index) => (
          <motion.div
            key={channel}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
          >
            <SelectionCard
              label={CHANNEL_LABELS[channel]}
              selected={value.includes(channel)}
              onSelect={() => handleToggle(channel)}
              multiSelect
            />
          </motion.div>
        ))}
      </div>

      {/* Other text input */}
      {isOtherSelected && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-2"
        >
          <label
            htmlFor="other-channel"
            className="block text-sm font-medium text-gray-700"
          >
            Please specify:
          </label>
          <Input
            id="other-channel"
            type="text"
            placeholder="Enter other channel..."
            value={otherText}
            onChange={(e) => onOtherTextChange(e.target.value)}
            className="h-12 text-base rounded-xl"
          />
        </motion.div>
      )}
    </motion.div>
  );
}

export default StepChannels;

