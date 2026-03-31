param(
  [string]$WorkbookPath = 'C:\Users\Theo\Downloads\inflow_demo_dashboard_dataset_2025_2026.xlsx',
  [string]$OutputPath = 'src\data\workbookSeed.js'
)

$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.IO.Compression.FileSystem

$script:SheetNamespace = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'
$script:ReferenceNow = '2026-03-30T18:00:00.000Z'

$dateColumns = @(
  'date',
  'month_start',
  'created_date',
  'qualification_date',
  'opening_date',
  'current_date',
  'desired_date',
  'objection_date',
  'book_date',
  'confirmed_date',
  'call_date',
  'close_date',
  'refund_date',
  'inactive_date'
)

$dailyColumns = @(
  'date',
  'day_name',
  'week',
  'month',
  'month_name',
  'year',
  'quarter',
  'is_weekend',
  'total_new_leads',
  'new_leads_qualified',
  'qualified_decisions',
  'unqualified_decisions',
  'opening_entries',
  'current_entries',
  'desired_entries',
  'objection_entries',
  'book_entries',
  'active_opening_eod',
  'active_current_eod',
  'active_desired_eod',
  'active_objection_eod',
  'active_book_eod',
  'active_threads_eod',
  'stalled_threads',
  'objection_price',
  'objection_time',
  'objection_trust',
  'objection_proof',
  'objection_call',
  'objection_self_doubt',
  'objection_fit',
  'objection_other',
  'inbound_messages',
  'ai_messages_sent',
  'avg_first_response_min',
  'avg_reply_latency_min',
  'replies_reviewed',
  'replies_good',
  'replies_minor_risk',
  'replies_misaligned',
  'guardrail_interventions',
  'avg_review_score',
  'booking_intent_yes',
  'booking_intent_maybe',
  'proposed_calls',
  'confirmed_calls',
  'calls_scheduled_today',
  'attended',
  'no_show',
  'at_risk_bookings',
  'closed_won',
  'closed_lost',
  'cash_collected',
  'refund_amount',
  'net_revenue',
  'show_rate',
  'close_rate_from_calls',
  'cost_per_lead',
  'cost_per_booked_call',
  'cost_per_acquired_customer',
  'avg_deal_value',
  'roas'
)

$leadColumns = @(
  'lead_id',
  'created_date',
  'created_month',
  'source_channel',
  'source_bucket',
  'campaign',
  'experience_level',
  'work_role',
  'commitment_level',
  'goal_type',
  'target_outcome_value',
  'current_gap_to_target',
  'funding_ability',
  'qualification_signal',
  'qualification_date',
  'objection_type',
  'booking_intent',
  'timezone',
  'opening_date',
  'current_date',
  'desired_date',
  'objection_date',
  'book_date',
  'confirmed_date',
  'call_date',
  'close_date',
  'refund_date',
  'inactive_date',
  'show_status',
  'close_outcome',
  'cash_collected',
  'refund_amount',
  'net_cash_after_refund',
  'first_response_minutes',
  'avg_reply_latency_minutes',
  'inbound_message_count',
  'outbound_message_count',
  'reviewed_replies',
  'avg_review_score',
  'review_verdict',
  'guardrail_interventions',
  'final_status',
  'quality_score_hidden_for_demo_logic'
)

function Get-EntryText {
  param(
    [System.IO.Compression.ZipArchive]$Zip,
    [string]$EntryName
  )

  $entry = $Zip.Entries | Where-Object FullName -eq $EntryName

  if (-not $entry) {
    throw "Workbook entry not found: $EntryName"
  }

  $reader = New-Object System.IO.StreamReader($entry.Open())

  try {
    return $reader.ReadToEnd()
  } finally {
    $reader.Close()
  }
}

function Get-NamespaceManager {
  param([xml]$XmlDocument)

  $namespaceManager = New-Object System.Xml.XmlNamespaceManager($XmlDocument.NameTable)
  $namespaceManager.AddNamespace('x', $script:SheetNamespace)
  return $namespaceManager
}

function Get-WorkbookSheetMap {
  param([System.IO.Compression.ZipArchive]$Zip)

  $workbook = [xml](Get-EntryText -Zip $Zip -EntryName 'xl/workbook.xml')
  $relationships = [xml](Get-EntryText -Zip $Zip -EntryName 'xl/_rels/workbook.xml.rels')
  $sheetMap = @{}

  foreach ($sheet in $workbook.GetElementsByTagName('sheet', $script:SheetNamespace)) {
    $relationshipId = $sheet.GetAttribute('id', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships')
    $relationship = $relationships.Relationships.Relationship | Where-Object Id -eq $relationshipId

    if ($relationship) {
      $target = [string]$relationship.Target
      $target = $target.TrimStart('/')

      if ($target -notlike 'xl/*') {
        $target = "xl/$target"
      }

      $sheetMap[$sheet.name] = $target
    }
  }

  return $sheetMap
}

function Convert-ExcelDate {
  param([string]$Value)

  if ([string]::IsNullOrWhiteSpace($Value)) {
    return ''
  }

  return ([datetime]'1899-12-30').AddDays([double]$Value).ToString('yyyy-MM-dd')
}

function Convert-CellValue {
  param(
    [string]$ColumnName,
    [string]$RawValue
  )

  if ([string]::IsNullOrWhiteSpace($RawValue)) {
    return ''
  }

  if ($dateColumns -contains $ColumnName) {
    return Convert-ExcelDate -Value $RawValue
  }

  if ($RawValue -match '^-?\d+$') {
    return [int]$RawValue
  }

  if ($RawValue -match '^-?\d+\.\d+$') {
    return [double]$RawValue
  }

  return $RawValue
}

function Get-ColumnIndex {
  param([string]$CellReference)

  $letters = $CellReference -replace '\d', ''
  $sum = 0

  foreach ($character in $letters.ToCharArray()) {
    $sum = ($sum * 26) + ([int][char]::ToUpper($character) - 64)
  }

  return $sum - 1
}

function Get-CellText {
  param(
    [System.Xml.XmlNode]$Cell
  )

  $inlineNode = $Cell.GetElementsByTagName('t', $script:SheetNamespace) | Select-Object -First 1

  if ($inlineNode) {
    return [string]$inlineNode.InnerText
  }

  $valueNode = $Cell.GetElementsByTagName('v', $script:SheetNamespace) | Select-Object -First 1

  if ($valueNode) {
    return [string]$valueNode.InnerText
  }

  return ''
}

function Get-SheetRows {
  param(
    [System.IO.Compression.ZipArchive]$Zip,
    [string]$SheetEntryName,
    [string[]]$SelectedColumns
  )

  $sheetDocument = [xml](Get-EntryText -Zip $Zip -EntryName $SheetEntryName)
  $rowNodes = $sheetDocument.GetElementsByTagName('row', $script:SheetNamespace)
  $headerRow = $rowNodes[0]
  $headerByIndex = @{}

  foreach ($cell in $headerRow.GetElementsByTagName('c', $script:SheetNamespace)) {
    $headerByIndex[(Get-ColumnIndex -CellReference $cell.r)] = Get-CellText -Cell $cell
  }

  $rows = New-Object System.Collections.Generic.List[object]

  foreach ($rowNode in ($rowNodes | Select-Object -Skip 1)) {
    $valueByHeader = @{}

    foreach ($cell in $rowNode.GetElementsByTagName('c', $script:SheetNamespace)) {
      $columnIndex = Get-ColumnIndex -CellReference $cell.r
      $columnName = $headerByIndex[$columnIndex]

      if (-not $columnName -or ($SelectedColumns -notcontains $columnName)) {
        continue
      }

      $valueByHeader[$columnName] = Convert-CellValue -ColumnName $columnName -RawValue (Get-CellText -Cell $cell)
    }

    $rowObject = [ordered]@{}

    foreach ($columnName in $SelectedColumns) {
      if ($valueByHeader.ContainsKey($columnName)) {
        $rowObject[$columnName] = $valueByHeader[$columnName]
      } else {
        $rowObject[$columnName] = ''
      }
    }

    $rows.Add([pscustomobject]$rowObject) | Out-Null
  }

  return $rows
}

if (-not (Test-Path -LiteralPath $WorkbookPath)) {
  throw "Workbook not found: $WorkbookPath"
}

$zip = [System.IO.Compression.ZipFile]::OpenRead($WorkbookPath)

try {
  $sheetMap = Get-WorkbookSheetMap -Zip $zip
  $dailyFacts = Get-SheetRows -Zip $zip -SheetEntryName $sheetMap['Daily_Facts'] -SelectedColumns $dailyColumns
  $leadFacts = Get-SheetRows -Zip $zip -SheetEntryName $sheetMap['Lead_Facts'] -SelectedColumns $leadColumns

  $seed = [ordered]@{
    referenceNow = $script:ReferenceNow
    generatedFrom = [System.IO.Path]::GetFileName($WorkbookPath)
    clients = @(
      [ordered]@{
        id = 'client-inflow-ai'
        companyName = 'Inflow AI'
        shortName = 'IN'
        industry = 'Growth Education'
        timezone = 'America/Los_Angeles'
        demoMode = $true
        accent = '#8f6dff'
        accentSoft = 'rgba(143, 109, 255, 0.16)'
        accentGlow = 'rgba(143, 109, 255, 0.32)'
      }
    )
    dailyFacts = $dailyFacts
    leadFacts = $leadFacts
  }

  $json = $seed | ConvertTo-Json -Depth 6 -Compress
  $output = @(
    '// Generated from inflow_demo_dashboard_dataset_2025_2026.xlsx'
    "export const workbookSeed = $json"
    'export default workbookSeed'
    ''
  ) -join [Environment]::NewLine

  $resolvedOutputPath = Resolve-Path -LiteralPath '.' | ForEach-Object {
    Join-Path $_.Path $OutputPath
  }
  $outputDirectory = Split-Path -Parent $resolvedOutputPath

  if (-not (Test-Path -LiteralPath $outputDirectory)) {
    New-Item -ItemType Directory -Path $outputDirectory | Out-Null
  }

  [System.IO.File]::WriteAllText($resolvedOutputPath, $output, [System.Text.Encoding]::UTF8)
  Write-Output "Wrote workbook seed to $resolvedOutputPath"
  Write-Output "Daily facts: $($dailyFacts.Count)"
  Write-Output "Lead facts: $($leadFacts.Count)"
} finally {
  $zip.Dispose()
}
