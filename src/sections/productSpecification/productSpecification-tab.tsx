import * as React from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import TabContext from '@mui/lab/TabContext';

type TabItem = {
  label: React.ReactNode;
  value: string;
  content: React.ReactNode;
};


type ProductSpecificationTabProps = {
  tabs: TabItem[];
  initialValue?: string;
  onChange?: (value: string) => void;
};

export default function ProductSpecificationTab({
  tabs,
  initialValue,
  onChange
}: ProductSpecificationTabProps) {
  const [value, setValue] = React.useState(initialValue || tabs[0]?.value || '1');

  const handleChange = (_event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
    onChange?.(newValue);
  };

  React.useEffect(() => {
    setValue(initialValue || tabs[0]?.value || '1');
  }, [initialValue]);

  return (
    <Box sx={{ width: '100%', typography: 'body1' }}>
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={handleChange} aria-label="custom tabs">
            {tabs.map((tab) => (
              <Tab key={tab.value} label={tab.label} value={tab.value} />
            ))}
          </TabList>
        </Box>
        {tabs.map((tab) => (
          <TabPanel key={tab.value} value={tab.value}>
            {tab.content}
          </TabPanel>
        ))}
      </TabContext>
    </Box>
  );
}
