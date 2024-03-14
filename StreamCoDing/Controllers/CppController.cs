using System;
using System.Diagnostics;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace StreamCoDing.Controllers
{
    public class CppCodeInput
    {
        public string CppCode { get; set; }
    }

    public class CppExecutionResult
    {
        public string StandardOutput { get; set; }
        public int ReturnValue { get; set; }
    }

    [ApiController]
    [Route("cppCompiler")]
    public class CppController : ControllerBase
    {
        private readonly ILogger<CppController> _logger;

        public CppController(ILogger<CppController> logger)
        {
            _logger = logger;
        }

        [HttpPost]
        public async Task<IActionResult> CompileAndRunCpp([FromBody] CppCodeInput input)
        {
            try
            {
                if (input == null || string.IsNullOrWhiteSpace(input.CppCode))
                {
                    return BadRequest("No valid C++ code provided.");
                }

                _logger.LogInformation("Received request with payload: {cppCode}", input.CppCode);

                string tempFile = Path.Combine(Path.GetTempPath(), $"{Guid.NewGuid()}.cpp");
                await System.IO.File.WriteAllTextAsync(tempFile, input.CppCode);

                string executableFile = Path.Combine(Path.GetTempPath(), $"{Guid.NewGuid()}.exe");

                using (Process process = new Process())
                {
                    process.StartInfo.FileName = "C:\\MinGW\\bin\\g++"; // Update this with the correct path to g++
                    process.StartInfo.Arguments = $"-o {executableFile} {tempFile}";
                    process.StartInfo.UseShellExecute = false;
                    process.StartInfo.RedirectStandardOutput = true;
                    process.StartInfo.RedirectStandardError = true; // Redirect standard error to capture compilation errors

                    process.Start();
                    string compilationErrorOutput = await process.StandardError.ReadToEndAsync(); // Read compilation errors
                    await process.WaitForExitAsync();

                    // Check if compilation was successful
                    if (!System.IO.File.Exists(executableFile) || !string.IsNullOrWhiteSpace(compilationErrorOutput))
                    {
                        return BadRequest($"Compilation failed. Error output: {compilationErrorOutput}");
                    }
                }

                // Execute compiled C++ code with a timeout
                using (var cts = new System.Threading.CancellationTokenSource())
                {
                    cts.CancelAfter(TimeSpan.FromSeconds(1)); // Set timeout to 1 second

                    var executionProcess = new Process();
                    executionProcess.StartInfo.FileName = executableFile;
                    executionProcess.StartInfo.UseShellExecute = false;
                    executionProcess.StartInfo.RedirectStandardOutput = true;

                    var timeoutTask = Task.Delay(TimeSpan.FromSeconds(1), cts.Token);
                    var executionTask = Task.Run(() =>
                    {
                        executionProcess.Start();
                        string output = executionProcess.StandardOutput.ReadToEnd();
                        executionProcess.WaitForExit();

                        int returnValue = executionProcess.ExitCode; // Capture return value

                        // Clean up temporary files
                        System.IO.File.Delete(tempFile);
                        System.IO.File.Delete(executableFile);

                        var executionResult = new CppExecutionResult
                        {
                            StandardOutput = output,
                            ReturnValue = returnValue
                        };

                        return executionResult;
                    });

                    // Wait for either execution to complete or timeout
                    await Task.WhenAny(executionTask, timeoutTask);

                    if (!executionTask.IsCompleted)
                    {
                        // Timeout occurred
                        return BadRequest("Execution timed out.");
                    }

                    return Ok(await executionTask);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing request: {message}", ex.Message);
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}