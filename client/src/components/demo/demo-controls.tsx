import { useState } from "react";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface DemoControlsProps {
  onDetectionLevelChange: (level: string) => void;
  onShowProcessingChange: (show: boolean) => void;
  onStorageFormatChange: (format: string) => void;
}

const examples = [
  { 
    text: "My credit card number is 4111-1111-1111-1111 and it expires on 01/25.",
    description: "Include credit card information"
  },
  { 
    text: "My social security number is 123-45-6789 and I live at 123 Main Street, New York, NY 10001.",
    description: "Include SSN and address"
  },
  { 
    text: "My date of birth is January 15, 1985 and my account number is A12345678.",
    description: "Include DOB and account number"
  }
];

export function DemoControls({ 
  onDetectionLevelChange,
  onShowProcessingChange,
  onStorageFormatChange
}: DemoControlsProps) {
  const [detectionLevel, setDetectionLevel] = useState("Medium (Standard)");
  const [showProcessing, setShowProcessing] = useState(true);
  const [storageFormat, setStorageFormat] = useState("JSON");
  
  const handleDetectionLevelChange = (value: string) => {
    setDetectionLevel(value);
    onDetectionLevelChange(value);
  };
  
  const handleShowProcessingChange = (checked: boolean) => {
    setShowProcessing(checked);
    onShowProcessingChange(checked);
  };
  
  const handleStorageFormatChange = (value: string) => {
    setStorageFormat(value);
    onStorageFormatChange(value);
  };

  return (
    <div className="bg-[#1E1E1E] rounded-xl overflow-hidden shadow-xl border border-gray-800">
      <div className="p-4 bg-[#121212] border-b border-gray-800">
        <h3 className="font-medium">Demo Features</h3>
      </div>
      
      <div className="p-4 space-y-6">
        <div>
          <h4 className="font-medium text-[#31E1F7] mb-2">Try These Examples:</h4>
          <div className="space-y-2">
            {examples.map((example, index) => (
              <motion.button 
                key={index}
                className="w-full text-left bg-[#121212] hover:bg-[#2D2D2D] transition-colors p-2 rounded text-sm text-gray-300"
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.98 }}
                data-example={example.text}
              >
                {example.description}
              </motion.button>
            ))}
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-4">
          <h4 className="font-medium text-[#31E1F7] mb-2">PII Types Detected:</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center">
              <div className="text-[#00FFCA] mr-2 text-xs">✓</div>
              <span className="text-gray-300">Names</span>
            </div>
            <div className="flex items-center">
              <div className="text-[#00FFCA] mr-2 text-xs">✓</div>
              <span className="text-gray-300">Emails</span>
            </div>
            <div className="flex items-center">
              <div className="text-[#00FFCA] mr-2 text-xs">✓</div>
              <span className="text-gray-300">Phone Numbers</span>
            </div>
            <div className="flex items-center">
              <div className="text-[#00FFCA] mr-2 text-xs">✓</div>
              <span className="text-gray-300">Addresses</span>
            </div>
            <div className="flex items-center">
              <div className="text-[#00FFCA] mr-2 text-xs">✓</div>
              <span className="text-gray-300">SSNs</span>
            </div>
            <div className="flex items-center">
              <div className="text-[#00FFCA] mr-2 text-xs">✓</div>
              <span className="text-gray-300">Credit Cards</span>
            </div>
            <div className="flex items-center">
              <div className="text-[#00FFCA] mr-2 text-xs">✓</div>
              <span className="text-gray-300">DOB</span>
            </div>
            <div className="flex items-center">
              <div className="text-[#00FFCA] mr-2 text-xs">✓</div>
              <span className="text-gray-300">Account #s</span>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-4">
          <h4 className="font-medium text-[#7B4DFF] mb-2">Demo Controls:</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">Detection Level</span>
              <Select 
                value={detectionLevel} 
                onValueChange={handleDetectionLevelChange}
              >
                <SelectTrigger className="w-40 bg-[#121212] border-gray-700 text-gray-300">
                  <SelectValue placeholder="Detection Level" />
                </SelectTrigger>
                <SelectContent className="bg-[#1E1E1E] border-gray-700 text-gray-300">
                  <SelectItem value="High (Sensitive)">High (Sensitive)</SelectItem>
                  <SelectItem value="Medium (Standard)">Medium (Standard)</SelectItem>
                  <SelectItem value="Low (Minimal)">Low (Minimal)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="show-processing" className="text-gray-300 text-sm">Show Processing</Label>
              <Switch 
                id="show-processing" 
                checked={showProcessing} 
                onCheckedChange={handleShowProcessingChange}
                className="data-[state=checked]:bg-[#00FFCA]"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">Storage Format</span>
              <Select 
                value={storageFormat} 
                onValueChange={handleStorageFormatChange}
              >
                <SelectTrigger className="w-40 bg-[#121212] border-gray-700 text-gray-300">
                  <SelectValue placeholder="Storage Format" />
                </SelectTrigger>
                <SelectContent className="bg-[#1E1E1E] border-gray-700 text-gray-300">
                  <SelectItem value="JSON">JSON</SelectItem>
                  <SelectItem value="Encrypted DB">Encrypted DB</SelectItem>
                  <SelectItem value="Token Reference">Token Reference</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
