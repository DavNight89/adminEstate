// CSV Parser Utility for Data Migration

/**
 * Parse CSV file content into an array of objects
 * @param {string} csvContent - Raw CSV file content
 * @returns {Array} Array of objects with headers as keys
 */
export const parseCSV = (csvContent) => {
  const lines = csvContent.split('\n').filter(line => line.trim());

  if (lines.length === 0) {
    throw new Error('CSV file is empty');
  }

  // Parse headers
  const headers = lines[0].split(',').map(header => header.trim());

  // Parse data rows
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);

    if (values.length === headers.length) {
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      data.push(row);
    }
  }

  return data;
};

/**
 * Parse a single CSV line, handling quoted values with commas
 * @param {string} line - A single CSV line
 * @returns {Array} Array of values
 */
const parseCSVLine = (line) => {
  const values = [];
  let currentValue = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === ',' && !insideQuotes) {
      values.push(currentValue.trim());
      currentValue = '';
    } else {
      currentValue += char;
    }
  }

  // Push the last value
  values.push(currentValue.trim());

  return values;
};

/**
 * Map CSV data to property format
 * @param {Array} csvData - Parsed CSV data
 * @returns {Array} Array of property objects
 */
export const mapCSVToProperties = (csvData) => {
  return csvData.map(row => ({
    id: Date.now() + Math.random(), // Temporary ID
    name: row.name || row.Name || row.property_name || row['Property Name'] || '',
    address: row.address || row.Address || row.property_address || row['Property Address'] || '',
    type: row.type || row.Type || row.property_type || row['Property Type'] || 'Residential',
    units: parseInt(row.units || row.Units || row.property_units || row['Property Units'] || row.total_units || row['Total Units'] || '0'),
    occupied: parseInt(row.occupied || row.Occupied || row.occupied_units || row['Occupied Units'] || '0'),
    monthlyRevenue: parseFloat(row.monthlyRevenue || row['Monthly Revenue'] || row.revenue || row.Revenue || '0'),
    purchasePrice: parseFloat(row.purchasePrice || row['Purchase Price'] || row.property_purchasePrice || row['Property Purchase Price'] || row.price || row.Price || '0'),
    purchaseDate: row.purchaseDate || row['Purchase Date'] || row.property_purchaseDate || row['Property Purchase Date'] || row.date || row.Date || '',
    status: row.status || row.Status || 'Active'
  }));
};

/**
 * Map CSV data to tenant format
 * @param {Array} csvData - Parsed CSV data
 * @returns {Array} Array of tenant objects
 */
export const mapCSVToTenants = (csvData) => {
  return csvData.map(row => {
    const name = row.name || row.Name || row.tenant_name || row['Tenant Name'] || '';
    const firstName = row.firstName || row['First Name'] || name.split(' ')[0] || '';
    const lastName = row.lastName || row['Last Name'] || name.split(' ').slice(1).join(' ') || '';

    return {
      id: Date.now() + Math.random(),
      name: name || `${firstName} ${lastName}`.trim(),
      email: row.email || row.Email || row.tenant_email || row['Tenant Email'] || '',
      phone: row.phone || row.Phone || row.tenant_phone || row['Tenant Phone'] || row.phone_number || row['Phone Number'] || '',
      property: row.property || row.Property || row.property_name || row['Property Name'] || '',
      unit: row.unit || row.Unit || row.tenant_unit || row['Tenant Unit'] || row.unit_number || row['Unit Number'] || '',
      rent: parseFloat(row.rent || row.Rent || row.tenant_rent || row['Tenant Rent'] || row.monthly_rent || row['Monthly Rent'] || '0'),
      leaseStart: row.leaseStart || row['Lease Start'] || row.lease_start || row.start_date || row['Start Date'] || '',
      leaseEnd: row.leaseEnd || row['Lease End'] || row.tenant_leaseEnd || row['Tenant Lease End'] || row.lease_end || row.end_date || row['End Date'] || '',
      status: row.status || row.Status || row.tenant_status || row['Tenant Status'] || 'Current',
      balance: parseFloat(row.balance || row.Balance || row.tenant_balance || row['Tenant Balance'] || row.outstanding || row.Outstanding || '0'),
      avatar: (name || `${firstName} ${lastName}`.trim()).split(' ').map(n => n[0]).join('').toUpperCase()
    };
  });
};

/**
 * Map CSV data to transaction format
 * @param {Array} csvData - Parsed CSV data
 * @returns {Array} Array of transaction objects
 */
export const mapCSVToTransactions = (csvData) => {
  return csvData.map(row => ({
    id: Date.now() + Math.random(),
    type: (row.type || row.Type || row.transaction_type || row['Transaction Type'] || 'income').toLowerCase(),
    amount: parseFloat(row.amount || row.Amount || '0'),
    description: row.description || row.Description || row.note || row.Note || '',
    date: row.date || row.Date || row.transaction_date || row['Transaction Date'] || new Date().toISOString().split('T')[0],
    category: row.category || row.Category || '',
    property: row.property || row.Property || row.property_name || row['Property Name'] || '',
    tenant: row.tenant || row.Tenant || row.tenant_name || row['Tenant Name'] || '',
    unit: row.unit || row.Unit || '',
    status: row.status || row.Status || 'completed'
  }));
};

/**
 * Map CSV data to work order format
 * @param {Array} csvData - Parsed CSV data
 * @returns {Array} Array of work order objects
 */
export const mapCSVToWorkOrders = (csvData) => {
  return csvData.map(row => ({
    id: Date.now() + Math.random(),
    title: row.title || row.Title || row.subject || row.Subject || row.description || row.Description || '',
    description: row.description || row.Description || row.details || row.Details || '',
    property: row.property || row.Property || row.property_name || row['Property Name'] || '',
    unit: row.unit || row.Unit || row.unit_number || row['Unit Number'] || '',
    tenant: row.tenant || row.Tenant || row.tenant_name || row['Tenant Name'] || '',
    priority: row.priority || row.Priority || 'Medium',
    status: row.status || row.Status || 'Open',
    category: row.category || row.Category || row.type || row.Type || 'Maintenance',
    dateSubmitted: row.dateSubmitted || row['Date Submitted'] || row.date || row.Date || new Date().toISOString().split('T')[0],
    assignedTo: row.assignedTo || row['Assigned To'] || row.assigned || row.Assigned || ''
  }));
};

/**
 * Detect the entity type from CSV headers
 * @param {Array} headers - CSV headers
 * @returns {string} Detected entity type
 */
export const detectEntityType = (headers) => {
  const lowerHeaders = headers.map(h => h.toLowerCase());

  // Check for most specific indicators first to avoid false matches

  // Tenant indicators (check before properties since tenants have "property" column)
  if (lowerHeaders.some(h => h.includes('lease') || h.includes('tenant')) ||
      (lowerHeaders.includes('email') && lowerHeaders.includes('property') && lowerHeaders.includes('unit'))) {
    return 'tenants';
  }

  // Property indicators (check for unique property fields)
  if (lowerHeaders.some(h => h.includes('units') || h.includes('purchase') || h.includes('address')) &&
      !lowerHeaders.includes('email')) {
    return 'properties';
  }

  // Transaction indicators
  if (lowerHeaders.some(h => h.includes('transaction') || h.includes('amount') || h.includes('payment'))) {
    return 'transactions';
  }

  // Work order indicators
  if (lowerHeaders.some(h => h.includes('work') || h.includes('maintenance') || h.includes('priority'))) {
    return 'workorders';
  }

  return 'unknown';
};

/**
 * Validate CSV data for a specific entity type
 * @param {Array} data - Parsed CSV data
 * @param {string} entityType - Type of entity
 * @returns {Object} Validation result with errors
 */
export const validateCSVData = (data, entityType) => {
  const errors = [];

  if (!data || data.length === 0) {
    return { valid: false, errors: ['CSV file is empty or invalid'] };
  }

  data.forEach((row, index) => {
    switch (entityType) {
      case 'properties':
        if (!row.name && !row.Name && !row.property_name && !row['Property Name']) {
          errors.push(`Row ${index + 2}: Property name is required`);
        }
        break;

      case 'tenants':
        if (!row.name && !row.Name && !row.tenant_name && !row['Tenant Name'] &&
            !row.firstName && !row['First Name']) {
          errors.push(`Row ${index + 2}: Tenant name is required`);
        }
        break;

      case 'transactions':
        if (!row.amount && !row.Amount) {
          errors.push(`Row ${index + 2}: Transaction amount is required`);
        }
        break;

      case 'workorders':
        if (!row.title && !row.Title && !row.description && !row.Description) {
          errors.push(`Row ${index + 2}: Work order title or description is required`);
        }
        break;
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Read CSV file and return content
 * @param {File} file - CSV file
 * @returns {Promise<string>} File content as string
 */
export const readCSVFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      resolve(e.target.result);
    };

    reader.onerror = () => {
      reject(new Error('Failed to read CSV file'));
    };

    reader.readAsText(file);
  });
};
